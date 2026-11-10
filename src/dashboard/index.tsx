import { Card, CardTitle, Kpi, Segmented, StackedBars, ago, bucketLabel, money, num } from '@/components/dash';
import { downloadCsv } from '@/components/save-report';
import { https } from '@/lib/https';
import { cn } from '@/lib/utils';
import Notifications from '@/layout/notifications';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Download } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

type Period = '7d' | '30d' | '12m';
type Overview = {
  period: Period;
  currency: string;
  currencies: string[];
  kpis: {
    revenue: { value: number; change: number | null; previous: number; spark: number[] };
    members: { value: number; change: number | null; joined: number; left: number; spark: number[] };
    signups: { value: number; change: number | null; becameMembers: number; spark: number[] };
    watchTime: { hours: number; change: number | null; minutesPerLearner: number; spark: number[] };
    bookings: { value: number; change: number | null; booked: number; spark: number[] };
    classes: { value: number; added: number; instructors: number };
  };
  revenue: { at: string; memberships: number; sessions: number; gifts: number; total: number; kept: number }[];
  members: { total: number; byPlan: { label: string; count: number }[]; renewingPercent: number | null; cancelledThisMonth: number };
  attention: {
    payoutRequests: { count: number; amounts: Record<string, number> };
    sessionRequests: number;
    drafts: { posts: number; classes: number };
    failedPayments: number;
  };
  topClasses: { id: number; title: string; instructor: string | null; viewers: number; watchHours: number; finishRate: number | null; rating: number | null; reviews: number; isHomepage: boolean; isActive: boolean }[];
  activity: { kind: string; at: string; text: string }[];
};

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '12m', label: '12 months' },
];
const PERIOD_WORDS: Record<Period, string> = { '7d': 'the 7 days before', '30d': 'the 30 days before', '12m': 'the year before' };
const MIX_COLORS = ['#305B43', '#9BC53D', '#D0EA50', '#E0A526', '#7FA88E', '#B9C7BE'];
const FEED: Record<string, { icon: string; bg: string; fg: string }> = {
  membership: { icon: '₦', bg: '#E3F2DC', fg: '#1E5B2E' },
  'session-paid': { icon: '1:1', bg: '#E3F2DC', fg: '#1E5B2E' },
  gift: { icon: 'G', bg: '#FFF4D6', fg: '#7A4F00' },
  rating: { icon: '★', bg: '#FFF4D6', fg: '#7A4F00' },
  payout: { icon: '↗', bg: '#E8F0E4', fg: '#305B43' },
  booking: { icon: '1:1', bg: '#E8F0E4', fg: '#305B43' },
  failed: { icon: '!', bg: '#FCE8E8', fg: '#A3262A' },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const Dashboard = () => {
  const [period, setPeriod] = useState<Period>('30d');
  const [currency, setCurrency] = useState('NGN');
  const me = useQuery({ queryKey: ['me'], queryFn: () => https.get('/user/profile').then(r => r.data.data as { fname: string }) });
  const q = useQuery({
    queryKey: ['admin-overview', period, currency],
    queryFn: () => https.get('/admin/overview', { params: { period, currency } }).then(r => r.data as Overview),
    placeholderData: prev => prev,
  });
  const d = q.data;
  const loading = q.isPending;
  const k = d?.kpis;
  const sym = (n: number) => money(n, currency);
  const currencies = (d?.currencies ?? ['NGN', 'USD']).slice(0, 4);

  const saveReport = () => {
    if (!d) return;
    downloadCsv(`upbreed-dashboard-${period}-${currency}`, [
      ['Upbreed dashboard', PERIODS.find(p => p.value === period)?.label, currency],
      [],
      ['Revenue', d.kpis.revenue.value],
      ['Active members', d.kpis.members.value],
      ['New sign-ups', d.kpis.signups.value],
      ['Watch time (hours)', d.kpis.watchTime.hours],
      ['1-on-1 bookings', d.kpis.bookings.value],
      ['Classes live', d.kpis.classes.value],
      [],
      ['Period', 'Memberships', '1-on-1', 'Gifts', 'Total'],
      ...d.revenue.map(r => [bucketLabel(r.at, period), r.memberships, r.sessions, r.gifts, r.total]),
      [],
      ['Class', 'Instructor', 'Viewers', 'Watch hours', 'Finish rate %', 'Rating'],
      ...d.topClasses.map(c => [c.title, c.instructor, c.viewers, c.watchHours, c.finishRate, c.rating]),
    ]);
  };

  const todo = d
    ? [
        {
          count: d.attention.payoutRequests.count,
          title: 'Payout requests',
          note: d.attention.payoutRequests.count
            ? Object.entries(d.attention.payoutRequests.amounts)
                .map(([c, v]) => money(v, c))
                .join(' + ') + ' waiting'
            : 'Nothing waiting',
          to: '/payouts',
          tone: 'bg-[#FFF4D6] text-[#7A4F00]',
        },
        { count: d.attention.sessionRequests, title: '1-on-1 requests', note: 'Waiting on instructors', to: '/1-1-sessions', tone: 'bg-[#E3F2DC] text-[#1E5B2E]' },
        {
          count: d.attention.drafts.posts + d.attention.drafts.classes,
          title: 'Drafts to publish',
          note: `${d.attention.drafts.posts} post${d.attention.drafts.posts === 1 ? '' : 's'}, ${d.attention.drafts.classes} class${d.attention.drafts.classes === 1 ? '' : 'es'}`,
          to: d.attention.drafts.classes ? '/projects' : '/blog',
          tone: 'bg-[#E8F0E4] text-[#305B43]',
        },
        { count: d.attention.failedPayments, title: 'Failed payments', note: 'Declined in the last 7 days', to: '/finance', tone: 'bg-[#FCE8E8] text-[#A3262A]' },
      ]
    : [];

  // Membership mix as one ring.
  const mixTotal = d?.members.byPlan.reduce((n, p) => n + p.count, 0) ?? 0;
  let acc = 0;
  const ring = d?.members.byPlan.length
    ? `conic-gradient(${d.members.byPlan
        .map((p, i) => {
          const from = acc;
          acc += (p.count / mixTotal) * 100;
          return `${MIX_COLORS[i % MIX_COLORS.length]} ${from}% ${acc}%`;
        })
        .join(', ')})`
    : '#EEF2EC';

  return (
    <div className="flex flex-col gap-6 text-[#00230F]">
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-4">
        <div className="mr-auto flex flex-col gap-1">
          <h1 className="text-[28px] font-bold tracking-tight">
            {greeting()}
            {me.data?.fname ? `, ${me.data.fname}` : ''}
          </h1>
          <p className="text-sm text-[#5E6B63]">Here is how Upbreed Learn is doing.</p>
        </div>
        <Segmented label="Period" value={period} options={PERIODS} onChange={setPeriod} />
        <Segmented label="Currency" accent="lime" value={currency} options={currencies.map(c => ({ value: c, label: c }))} onChange={setCurrency} />
        <button
          type="button"
          onClick={saveReport}
          disabled={!d}
          className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#DDE5DB] bg-white px-3.5 text-[13px] font-semibold hover:border-[#305B43] disabled:opacity-50"
        >
          <Download className="size-4" /> Save report
        </button>
        <div className="grid size-11 place-items-center rounded-xl border border-[#DDE5DB] bg-white">
          <Notifications />
        </div>
      </header>

      {/* Key numbers */}
      <section aria-label="Key numbers" className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-[1700px]:grid-cols-6', q.isFetching && !loading && 'opacity-70 transition-opacity')}>
        <Kpi hero loading={loading} label="Revenue" value={sym(k?.revenue.value ?? 0)} change={k?.revenue.change} spark={k?.revenue.spark} note={`vs ${sym(k?.revenue.previous ?? 0)} in ${PERIOD_WORDS[period]}`} />
        <Kpi loading={loading} label="Active members" value={num(k?.members.value ?? 0)} change={k?.members.change} spark={k?.members.spark} note={`${num(k?.members.joined ?? 0)} joined, ${num(k?.members.left ?? 0)} left`} />
        <Kpi loading={loading} label="New sign-ups" value={num(k?.signups.value ?? 0)} change={k?.signups.change} spark={k?.signups.spark} note={`${k?.signups.becameMembers ?? 0}% became members`} />
        <Kpi loading={loading} label="Watch time" value={`${num(k?.watchTime.hours ?? 0)} h`} change={k?.watchTime.change} spark={k?.watchTime.spark} note={`About ${k?.watchTime.minutesPerLearner ?? 0} min per learner`} />
        <Kpi loading={loading} label="1-on-1 bookings" value={num(k?.bookings.value ?? 0)} change={k?.bookings.change} spark={k?.bookings.spark} note={`${sym(k?.bookings.booked ?? 0)} paid`} />
        <Kpi
          loading={loading}
          label="Classes live"
          value={num(k?.classes.value ?? 0)}
          change={k ? k.classes.added : undefined}
          changeSuffix=" new"
          note={`${k?.classes.instructors ?? 0} instructor${k?.classes.instructors === 1 ? '' : 's'}`}
        />
      </section>

      {/* Revenue + members */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle
            title="Revenue"
            note={`Memberships, 1-on-1 sessions and gifts, in ${currency}`}
            right={
              <div className="flex flex-wrap gap-4 text-[13px] text-[#34433A]">
                {[
                  ['#305B43', 'Memberships'],
                  ['#9BC53D', '1-on-1'],
                  ['#E0A526', 'Gifts'],
                ].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-[3px]" style={{ background: c }} />
                    {l}
                  </span>
                ))}
              </div>
            }
          />
          {loading ? (
            <div className="h-[260px] animate-pulse rounded-xl bg-[#F3F6F2]" />
          ) : (
            <StackedBars
              currency={currency}
              highlightLast
              rows={(d?.revenue ?? []).map(r => ({
                label: bucketLabel(r.at, period),
                parts: [
                  { value: r.memberships, color: '#305B43', name: 'Memberships' },
                  { value: r.sessions, color: '#9BC53D', name: '1-on-1' },
                  { value: r.gifts, color: '#E0A526', name: 'Gifts' },
                ],
              }))}
            />
          )}
        </Card>

        <Card>
          <CardTitle title="Members" note="Who has access right now, by plan" />
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative size-[140px] shrink-0 rounded-full" style={{ background: ring }}>
              <div className="absolute inset-[18px] grid place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-[26px] font-bold tabular-nums">{num(d?.members.total ?? 0)}</p>
                  <p className="text-[11px] text-[#5E6B63]">active member{d?.members.total === 1 ? '' : 's'}</p>
                </div>
              </div>
            </div>
            <ul className="flex min-w-[170px] flex-1 flex-col gap-2.5 text-[13px]">
              {d?.members.byPlan.length ? (
                d.members.byPlan.map((p, i) => (
                  <li key={p.label} className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: MIX_COLORS[i % MIX_COLORS.length] }} />
                    <span className="leading-tight">{p.label}</span>
                    <b className="ml-auto tabular-nums">{Math.round((p.count / mixTotal) * 100)}%</b>
                  </li>
                ))
              ) : (
                <li className="text-[#5E6B63]">{loading ? 'Loading…' : 'No members yet.'}</li>
              )}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2EC] pt-4">
            <div>
              <p className="text-xs text-[#5E6B63]">Set to renew</p>
              <p className="mt-0.5 text-xl font-bold">{d?.members.renewingPercent == null ? '—' : `${d.members.renewingPercent}%`}</p>
            </div>
            <div>
              <p className="text-xs text-[#5E6B63]">Cancelled this month</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{num(d?.members.cancelledThisMonth ?? 0)}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Needs attention */}
      <section aria-label="Needs your attention" className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {(loading ? [0, 1, 2, 3] : todo).map((t, i) =>
          typeof t === 'number' ? (
            <div key={i} className="h-[82px] animate-pulse rounded-2xl border border-[#E3EAE1] bg-white" />
          ) : (
            <Link key={t.title} to={t.to} className="flex items-center gap-3.5 rounded-2xl border border-[#E3EAE1] bg-white p-[18px] transition-colors hover:border-[#305B43]">
              <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl text-lg font-bold tabular-nums', t.count ? t.tone : 'bg-[#F0F2EF] text-[#5E6B63]')}>{t.count}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold">{t.title}</span>
                <span className="truncate text-xs text-[#5E6B63]">{t.note}</span>
              </span>
              <ChevronRight className="ml-auto size-[18px] shrink-0 text-[#5E6B63]" />
            </Link>
          ),
        )}
      </section>

      {/* Top classes + activity */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle
            title="Top classes"
            right={
              <Link to="/courses" className="text-[13px] font-semibold text-[#305B43] hover:text-[#00230F]">
                All classes
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-xs text-[#5E6B63]">
                  <th scope="col" className="py-2 pr-2 font-medium">Class</th>
                  <th scope="col" className="p-2 font-medium">Viewers</th>
                  <th scope="col" className="p-2 font-medium">Watch time</th>
                  <th scope="col" className="w-40 p-2 font-medium">Finish rate</th>
                  <th scope="col" className="p-2 font-medium">Rating</th>
                  <th scope="col" className="py-2 pl-2 font-medium">On homepage</th>
                </tr>
              </thead>
              <tbody>
                {(d?.topClasses ?? []).map(c => (
                  <tr key={c.id} className="border-t border-[#EEF2EC]">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[#305B43] text-[13px] font-bold text-[#D0EA50]">
                          {c.title
                            .split(' ')
                            .slice(0, 2)
                            .map(w => w[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <Link to={`/projects/${c.id}`} className="truncate font-semibold hover:text-[#305B43]">
                            {c.title}
                          </Link>
                          <span className="text-xs text-[#5E6B63]">{c.instructor ?? '—'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="p-2 font-semibold tabular-nums">{num(c.viewers)}</td>
                    <td className="p-2 tabular-nums">{num(c.watchHours)} h</td>
                    <td className="p-2">
                      {c.finishRate == null ? (
                        <span className="text-[#5E6B63]">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF2EC]">
                            <span className="block h-full bg-[#34A853]" style={{ width: `${c.finishRate}%` }} />
                          </span>
                          <span className="w-9 tabular-nums">{c.finishRate}%</span>
                        </div>
                      )}
                    </td>
                    <td className="p-2 tabular-nums">{c.rating ? `★ ${c.rating.toFixed(1)}` : <span className="text-[#5E6B63]">No ratings</span>}</td>
                    <td className="py-3 pl-2">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', c.isHomepage ? 'bg-[#E3F2DC] text-[#1E5B2E]' : 'bg-[#F0F2EF] text-[#5E6B63]')}>
                        {c.isHomepage ? 'Shown' : 'Hidden'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && !d?.topClasses.length && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#5E6B63]">
                      No classes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardTitle title="Latest activity" />
          <ol className="flex flex-col">
            {(d?.activity ?? []).map((f, i) => {
              const s = FEED[f.kind] ?? FEED.booking;
              return (
                <li key={i} className="flex gap-3 border-t border-[#EEF2EC] py-2.5 first:border-t-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold" style={{ background: s.bg, color: s.fg }}>
                    {f.kind === 'membership' ? (currency === 'NGN' ? '₦' : '$') : s.icon}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13px] leading-snug">{f.text}</span>
                    <span className="text-[11px] text-[#5E6B63]">{ago(f.at)}</span>
                  </span>
                </li>
              );
            })}
            {!loading && !d?.activity.length && <li className="text-[13px] text-[#5E6B63]">Nothing yet.</li>}
          </ol>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
