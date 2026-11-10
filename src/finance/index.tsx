import { Card, CardTitle, Delta, Lines, Segmented, bucketLabel, money, num, shortMoney } from '@/components/dash';
import { downloadCsv } from '@/components/save-report';
import { https } from '@/lib/https';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

type Period = '24h' | '7d' | '30d' | '12m';
type Finance = {
  period: Period;
  currency: string;
  currencies: string[];
  sharePercent: number;
  kpis: {
    received: { value: number; change: number | null };
    thisMonth: { value: number; change: number | null };
    kept: { value: number; percent: number | null; instructorShares: number };
    monthlyRecurring: { value: number };
    failed: { count: number; amount: number };
    perPayer: { value: number; payers: number };
  };
  series: { at: string; total: number; kept: number }[];
  sources: { memberships: number; sessions: number; gifts: number; total: number };
  countries: { country: string; share: number; payments: number }[];
};
type Balance = {
  instructor: { id: number; name: string; email: string };
  bank: { bank: string | null; accountNo: string | null };
  byCurrency: Record<string, { pendingPayout: number }>;
  requests?: { id: number; currency: string; amount: number; requestedAt: string }[];
};
type Tx = {
  id: number;
  reference: string;
  userName: string;
  email: string | null;
  transactionDate: string;
  paymentGateway: string;
  paymentType: string;
  status: string;
  currency: string;
  amount: { value: number };
  planName: string | null;
};

const PERIODS: { value: Period; label: string }[] = [
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '12m', label: '12 months' },
];
const PERIOD_NAME: Record<Period, string> = { '24h': 'last 24 hours', '7d': 'last 7 days', '30d': 'last 30 days', '12m': '12 months' };
const COUNTRY: Record<string, string> = { NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya', ZA: 'South Africa', GB: 'United Kingdom', US: 'United States', OTHER: 'Elsewhere' };
const MINIMUM: Record<string, number> = { NGN: 100_000, USD: 100, GHS: 1_500, KES: 13_000, ZAR: 1_800, GBP: 80, EUR: 90 };
const STATUS: Record<string, { label: string; cls: string }> = {
  SUCCESS: { label: 'Paid', cls: 'bg-[#E3F2DC] text-[#1E5B2E]' },
  PENDING: { label: 'Pending', cls: 'bg-[#FFF4D6] text-[#7A4F00]' },
  FAILED: { label: 'Failed', cls: 'bg-[#FCE8E8] text-[#A3262A]' },
};
const WHAT: Record<string, string> = { SUBSCRIPTION: 'Membership', RENEWAL: 'Membership renewal', GIFT: 'Gift membership', SESSION: '1-on-1 session' };

const Finance = () => {
  const [period, setPeriod] = useState<Period>('12m');
  const [currency, setCurrency] = useState('NGN');
  const [status, setStatus] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search, 350);

  const fin = useQuery({
    queryKey: ['finance-overview', period, currency],
    queryFn: () => https.get('/admin/finance/overview', { params: { period, currency } }).then(r => r.data as Finance),
    placeholderData: prev => prev,
  });
  const balances = useQuery({ queryKey: ['payout-balances'], queryFn: () => https.get('/admin/payouts/balances').then(r => r.data.data as Balance[]) });
  const tx = useQuery({
    queryKey: ['payments', status, q, page],
    queryFn: () =>
      https
        .get('/admin/payments', { params: { status, search: q || undefined, page, limit: 8 } })
        .then(r => r.data as { data: Tx[]; metadata: { total: number; page: number; totalPages?: number; limit: number } }),
    placeholderData: prev => prev,
  });

  const d = fin.data;
  const k = d?.kpis;
  const m = (n: number) => money(n, currency);
  const loading = fin.isPending;
  const currencies = (d?.currencies ?? ['NGN', 'USD']).slice(0, 4);

  const owed = (balances.data ?? [])
    .map(b => {
      const amount = b.byCurrency[currency]?.pendingPayout ?? 0;
      const request = b.requests?.find(r => r.currency === currency);
      return { ...b, amount, request };
    })
    .filter(b => b.amount > 0)
    .sort((a, b) => Number(Boolean(b.request)) - Number(Boolean(a.request)) || b.amount - a.amount);
  const owedTotal = owed.reduce((n, b) => n + b.amount, 0);
  const minimum = MINIMUM[currency] ?? 100;

  const exportCsv = async () => {
    const all = await https.get('/admin/payments', { params: { status, search: q || undefined, page: 1, limit: 100 } }).then(r => r.data.data as Tx[]);
    downloadCsv(`upbreed-transactions-${status.toLowerCase()}`, [
      ['Date', 'Name', 'Email', 'What for', 'Paid with', 'Status', 'Currency', 'Amount', 'Reference'],
      ...all.map(t => [t.transactionDate, t.userName, t.email, t.planName ? `${WHAT[t.paymentType] ?? t.paymentType} · ${t.planName}` : WHAT[t.paymentType] ?? t.paymentType, t.paymentGateway, STATUS[t.status]?.label ?? t.status, t.currency, t.amount.value, t.reference]),
    ]);
  };

  const totalPages = tx.data ? Math.max(1, Math.ceil(tx.data.metadata.total / 8)) : 1;
  const kpiCard = (label: string, value: string, note: React.ReactNode, hero?: boolean) => (
    <article className={cn('flex min-w-0 flex-col gap-1.5 rounded-[18px] border p-[18px]', hero ? 'border-[#305B43] bg-[#305B43] text-white' : 'border-[#E3EAE1] bg-white')}>
      <p className={cn('text-[13px] font-medium', hero ? 'text-[#D0EA50]' : 'text-[#5E6B63]')}>{label}</p>
      {loading ? <div className={cn('h-8 w-2/3 animate-pulse rounded', hero ? 'bg-white/15' : 'bg-[#EEF2EC]')} /> : <p className="truncate text-[28px]/[1.15] font-bold tracking-tight tabular-nums">{value}</p>}
      <div className={cn('flex flex-wrap items-center gap-1.5 text-xs', hero ? 'text-[#D7E2DA]' : 'text-[#5E6B63]')}>{loading ? ' ' : note}</div>
    </article>
  );

  return (
    <div className="flex flex-col gap-6 text-[#00230F]">
      <header className="flex flex-wrap items-center gap-4">
        <div className="mr-auto flex flex-col gap-1">
          <h1 className="text-[28px] font-bold tracking-tight">Finance</h1>
          <p className="text-sm text-[#5E6B63]">Money in, money owed to instructors, and every payment.</p>
        </div>
        <Segmented dark label="Period" value={period} options={PERIODS} onChange={setPeriod} />
        <Segmented accent="lime" label="Currency" value={currency} options={currencies.map(c => ({ value: c, label: c }))} onChange={setCurrency} />
        <button type="button" onClick={exportCsv} className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#DDE5DB] bg-white px-3.5 text-[13px] font-semibold hover:border-[#305B43]">
          <Download className="size-4" /> Export CSV
        </button>
      </header>

      {/* Headline numbers */}
      <section aria-label="Headline numbers" className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-[1700px]:grid-cols-6', fin.isFetching && !loading && 'opacity-70')}>
        {kpiCard(`Received (${PERIOD_NAME[period]})`, m(k?.received.value ?? 0), <><Delta change={k?.received.change} hero /> vs the period before</>, true)}
        {kpiCard('This month', m(k?.thisMonth.value ?? 0), <><Delta change={k?.thisMonth.change} /> vs the same days last month</>)}
        {kpiCard('We keep', m(k?.kept.value ?? 0), k?.kept.percent == null ? 'Nothing received yet' : `${k.kept.percent}% after instructor shares (before card fees)`)}
        {kpiCard('Monthly recurring', m(k?.monthlyRecurring.value ?? 0), 'From memberships set to renew')}
        {kpiCard('Failed payments', num(k?.failed.count ?? 0), k?.failed.count ? `${m(k.failed.amount)} declined` : 'None in this period')}
        {kpiCard('Per paying person', m(k?.perPayer.value ?? 0), `${num(k?.perPayer.payers ?? 0)} paid in this period`)}
      </section>

      {/* Trend + sources */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle
            title="Revenue over time"
            note="Money received, and what we keep after instructor shares"
            right={
              <div className="flex gap-4 text-[13px] text-[#34433A]">
                <span className="flex items-center gap-1.5"><span className="h-[3px] w-3.5 rounded bg-[#305B43]" />Received</span>
                <span className="flex items-center gap-1.5"><span className="h-[3px] w-3.5 rounded bg-[#E0A526]" />We keep</span>
              </div>
            }
          />
          {loading ? (
            <div className="h-[270px] animate-pulse rounded-xl bg-[#F3F6F2]" />
          ) : (
            <Lines
              label={`Money received over the ${PERIOD_NAME[period]}, in ${currency}`}
              labels={(d?.series ?? []).map(s => bucketLabel(s.at, period))}
              axis={n => shortMoney(n, currency)}
              series={[
                { values: (d?.series ?? []).map(s => s.total), color: '#305B43', fill: true },
                { values: (d?.series ?? []).map(s => s.kept), color: '#E0A526' },
              ]}
            />
          )}
        </Card>

        <Card>
          <CardTitle title="Where it comes from" note={PERIOD_NAME[period][0].toUpperCase() + PERIOD_NAME[period].slice(1)} />
          {(() => {
            const s = d?.sources;
            const parts = [
              { name: 'Memberships', value: s?.memberships ?? 0, color: '#305B43' },
              { name: '1-on-1 sessions', value: s?.sessions ?? 0, color: '#9BC53D' },
              { name: 'Gift memberships', value: s?.gifts ?? 0, color: '#E0A526' },
            ];
            const total = s?.total ?? 0;
            return (
              <>
                <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-[#EEF2EC]">
                  {total > 0 && parts.map(p => <span key={p.name} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
                </div>
                <ul className="flex flex-col gap-3 text-[13px]">
                  {parts.map(p => (
                    <li key={p.name} className="flex items-center gap-2">
                      <span className="size-2.5 rounded-[3px]" style={{ background: p.color }} />
                      {p.name}
                      <span className="ml-auto text-[#5E6B63]">{total ? Math.round((p.value / total) * 100) : 0}%</span>
                      <b className="w-28 text-right tabular-nums">{m(p.value)}</b>
                    </li>
                  ))}
                </ul>
              </>
            );
          })()}
          <div className="flex flex-col gap-2.5 border-t border-[#EEF2EC] pt-4">
            <h3 className="text-sm font-semibold">By country</h3>
            <p className="-mt-1.5 text-xs text-[#5E6B63]">Share of payments, all currencies</p>
            {d?.countries.length ? (
              d.countries.slice(0, 5).map(c => (
                <div key={c.country} className="flex items-center gap-2.5 text-[13px]">
                  <span className="w-28 truncate">{COUNTRY[c.country] ?? c.country}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEF2EC]">
                    <span className="block h-full bg-[#305B43]" style={{ width: `${c.share}%` }} />
                  </span>
                  <span className="w-10 text-right text-[#5E6B63] tabular-nums">{c.share}%</span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-[#5E6B63]">{loading ? 'Loading…' : 'No payments in this period.'}</p>
            )}
          </div>
        </Card>
      </section>

      {/* Owed to instructors */}
      <Card dark>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#D0EA50]">Owed to instructors</h2>
            <p className="mt-1 text-[13px] text-[#B9C7BE]">
              They keep {d?.sharePercent ?? 80}% of each paid 1-on-1. Payouts open at {money(minimum, currency)}.
            </p>
          </div>
          <p className="text-[28px] font-bold tabular-nums">{m(owedTotal)}</p>
        </div>
        {owed.length ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
            {owed.map(o => {
              const ready = o.amount >= minimum;
              const progress = Math.min(100, Math.round((o.amount / minimum) * 100));
              return (
                <div key={o.instructor.id} className="flex flex-col gap-2.5 rounded-[14px] border border-[#1F4D33] bg-[#0B3A20] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold">{o.instructor.name}</span>
                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold', o.request ? 'bg-[#D0EA50] text-[#00230F]' : ready ? 'bg-[#305B43] text-[#E8F0E4]' : 'bg-[#1F4D33] text-[#B9C7BE]')}>
                      {o.request ? 'Asked to be paid' : ready ? 'Can be paid' : 'Below minimum'}
                    </span>
                  </div>
                  <p className="text-[22px] font-bold tabular-nums">{m(o.amount)}</p>
                  <span className="h-1.5 overflow-hidden rounded-full bg-[#1F4D33]">
                    <span className="block h-full" style={{ width: `${progress}%`, background: ready ? '#D0EA50' : '#6F8F7B' }} />
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-[#B9C7BE]">
                      {o.request
                        ? `Asked ${new Date(o.request.requestedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}${o.bank.bank ? ` · ${o.bank.bank}` : ''}`
                        : ready
                          ? o.bank.bank ?? 'No bank details yet'
                          : `${m(minimum - o.amount)} to go`}
                    </span>
                    {ready ? (
                      <Link to="/payouts" className="shrink-0 rounded-[10px] bg-[#D0EA50] px-3 py-2 text-xs font-bold text-[#00230F]">
                        Record payout
                      </Link>
                    ) : (
                      <span className="shrink-0 rounded-[10px] bg-[#1F4D33] px-3 py-2 text-xs font-bold text-[#8FA597]">Not yet</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-[#B9C7BE]">{balances.isPending ? 'Loading…' : `Nothing owed in ${currency} right now.`}</p>
        )}
      </Card>

      {/* Transactions */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="mr-auto text-lg font-semibold">Transactions</h2>
          <label className="flex h-11 min-w-60 items-center gap-2 rounded-xl border border-[#DDE5DB] px-3 text-[#5E6B63] focus-within:border-[#305B43]">
            <Search className="size-4" />
            <span className="sr-only">Search transactions</span>
            <input
              type="search"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Name, email or reference"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#00230F] outline-none"
            />
          </label>
          <div role="group" aria-label="Status" className="flex flex-wrap gap-1.5">
            {(
              [
                ['ALL', 'All'],
                ['SUCCESS', 'Paid'],
                ['PENDING', 'Pending'],
                ['FAILED', 'Failed'],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                aria-pressed={status === v}
                onClick={() => {
                  setStatus(v);
                  setPage(1);
                }}
                className={cn('cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold', status === v ? 'border-[#00230F] bg-[#00230F] text-white' : 'border-[#DDE5DB] bg-white hover:border-[#305B43]')}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className={cn('overflow-x-auto', tx.isFetching && 'opacity-70')}>
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-xs text-[#5E6B63]">
                <th scope="col" className="py-2 pr-2 font-medium">Person</th>
                <th scope="col" className="p-2 font-medium">What for</th>
                <th scope="col" className="p-2 font-medium">Date</th>
                <th scope="col" className="p-2 font-medium">Paid with</th>
                <th scope="col" className="p-2 font-medium">Status</th>
                <th scope="col" className="py-2 pl-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(tx.data?.data ?? []).map(t => (
                <tr key={t.id} className="border-t border-[#EEF2EC]">
                  <td className="py-3 pr-2">
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold">{t.userName}</span>
                      <span className="text-xs text-[#5E6B63]">{t.reference}</span>
                    </span>
                  </td>
                  <td className="p-2">
                    {WHAT[t.paymentType] ?? t.paymentType}
                    {t.planName ? <span className="text-[#5E6B63]"> · {t.planName}</span> : null}
                  </td>
                  <td className="p-2 text-[#34433A]">{new Date(t.transactionDate).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-2 text-[#34433A] capitalize">{t.paymentGateway.toLowerCase()}</td>
                  <td className="p-2">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS[t.status]?.cls ?? 'bg-[#F0F2EF] text-[#4A564E]')}>{STATUS[t.status]?.label ?? t.status}</span>
                  </td>
                  <td className="py-3 pl-2 text-right font-bold tabular-nums">{money(t.amount.value, t.currency)}</td>
                </tr>
              ))}
              {!tx.isPending && !tx.data?.data.length && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#5E6B63]">
                    {q ? 'No payments match that search.' : 'No payments yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#5E6B63]">
          <span>
            {tx.data?.metadata.total
              ? `Showing ${(page - 1) * 8 + 1}–${Math.min(page * 8, tx.data.metadata.total)} of ${num(tx.data.metadata.total)}`
              : ' '}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="cursor-pointer rounded-[10px] border border-[#DDE5DB] bg-white px-3.5 py-2.5 font-semibold text-[#00230F] disabled:cursor-not-allowed disabled:opacity-40">
              Previous
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="cursor-pointer rounded-[10px] border border-[#DDE5DB] bg-white px-3.5 py-2.5 font-semibold text-[#00230F] disabled:cursor-not-allowed disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Finance;
