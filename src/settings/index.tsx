import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { https } from '@/lib/https';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Me = { id: number; email: string; fname: string; lname: string; phone: string | null };
type AdminRow = { id: number; email: string; fname: string; lname: string };

const errorMessage = (e: any) => {
  const m = e?.response?.data?.message;
  return (Array.isArray(m) ? m.join(', ') : m) || e?.message || 'Something went wrong';
};
const field = 'h-10 w-full rounded-lg border border-[#D9D9D9] bg-white px-3 text-sm outline-none focus:border-[#305B43]';
const card = 'flex flex-col gap-4 rounded-xl border border-[#D9D9D9] p-6';

const PASSWORD_RULES: [string, (p: string) => boolean][] = [
  ['8+ characters', p => p.length >= 8],
  ['A–Z', p => /[A-Z]/.test(p)],
  ['a–z', p => /[a-z]/.test(p)],
  ['0–9', p => /[0-9]/.test(p)],
  ['!@#', p => /[^A-Za-z0-9]/.test(p)],
];

const Settings = () => {
  const me = useQuery({ queryKey: ['me'], queryFn: () => https.get('/user/profile').then(r => r.data.data as Me) });
  return (
    <div className="flex flex-col gap-8 pb-16">
      <div>
        <h1>Settings</h1>
        <p className="text-sm text-[#737373]">Your admin profile, password and who else can use this dashboard.</p>
      </div>
      {me.isPending ? <Skeleton className="h-48 w-full" /> : me.isError ? <p className="text-sm text-red-600">Could not load your profile.</p> : <Profile me={me.data} />}
      <ChangePassword />
      <Admins myId={me.data?.id} />
    </div>
  );
};

function Profile({ me }: { me: Me }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ fname: me.fname, lname: me.lname, phone: me.phone ?? '' });
  useEffect(() => setForm({ fname: me.fname, lname: me.lname, phone: me.phone ?? '' }), [me]);
  const save = useMutation({
    mutationFn: () => https.patch('/user/profile', { fname: form.fname.trim(), lname: form.lname.trim(), phone: form.phone.trim() }),
    onSuccess: () => {
      toast.success('Profile saved');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: e => toast.error('Could not save', { description: errorMessage(e) }),
  });
  const changed = form.fname !== me.fname || form.lname !== me.lname || form.phone !== (me.phone ?? '');
  return (
    <section className={card}>
      <p className="font-semibold">My profile</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-[#737373]">
          First name
          <input className={field} value={form.fname} onChange={e => setForm({ ...form, fname: e.target.value })} maxLength={100} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-[#737373]">
          Last name
          <input className={field} value={form.lname} onChange={e => setForm({ ...form, lname: e.target.value })} maxLength={100} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-[#737373]">
          Email
          <input className={`${field} bg-[#F5F5F5] text-[#737373]`} value={me.email} disabled />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-[#737373]">
          Phone
          <input className={field} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={30} />
        </label>
      </div>
      <Button className="w-max" disabled={!changed || !form.fname.trim() || !form.lname.trim() || save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </section>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const strong = PASSWORD_RULES.every(([, ok]) => ok(next));
  const change = useMutation({
    mutationFn: () => https.post('/auth/password/change', { currentPassword: current, newPassword: next }),
    onSuccess: () => {
      toast.success('Password changed');
      setCurrent('');
      setNext('');
      setAgain('');
    },
    onError: e => toast.error('Could not change password', { description: errorMessage(e) }),
  });
  return (
    <section className={card}>
      <p className="font-semibold">Change password</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <input type="password" autoComplete="current-password" placeholder="Current password" className={field} value={current} onChange={e => setCurrent(e.target.value)} />
        <input type="password" autoComplete="new-password" placeholder="New password" className={field} value={next} onChange={e => setNext(e.target.value)} />
        <input type="password" autoComplete="new-password" placeholder="Repeat new password" className={field} value={again} onChange={e => setAgain(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PASSWORD_RULES.map(([label, ok]) => (
          <span key={label} className={`rounded-full px-2 py-0.5 text-[11px] ${ok(next) ? 'bg-[#34A853]/15 text-[#1E7A3A]' : 'bg-[#F0F0F0] text-[#9B9B9B]'}`}>
            {label}
          </span>
        ))}
        {again && again !== next && <span className="text-[11px] text-red-600">Passwords don&apos;t match</span>}
      </div>
      <Button className="w-max" disabled={!current || !strong || next !== again || change.isPending} onClick={() => change.mutate()}>
        {change.isPending ? 'Changing…' : 'Change password'}
      </Button>
    </section>
  );
}

function Admins({ myId }: { myId?: number }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const admins = useQuery({ queryKey: ['admins'], queryFn: () => https.get('/admin/admins').then(r => r.data.data as AdminRow[]) });
  const add = useMutation({
    mutationFn: () => https.post('/admin/role/add', { email: email.trim().toLowerCase() }),
    onSuccess: () => {
      toast.success('Admin added', { description: 'They can now log in at admin.upbreedlearn.com with their Upbreed account.' });
      setEmail('');
      qc.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: e => toast.error('Could not add admin', { description: errorMessage(e) }),
  });
  const remove = useMutation({
    mutationFn: (userId: number) => https.delete('/admin/role/remove', { data: { userId } }),
    onSuccess: () => {
      toast.success('Admin access removed');
      qc.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: e => toast.error('Could not remove', { description: errorMessage(e) }),
  });
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <section className={card}>
      <div>
        <p className="font-semibold">Admins</p>
        <p className="text-xs text-[#737373]">The person must already have an Upbreed account (they sign up on the website first).</p>
      </div>
      {admins.isPending ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <ul className="flex flex-col divide-y divide-[#EEE] text-sm">
          {admins.data?.map(a => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
              <div>
                <p className="font-medium">
                  {a.fname} {a.lname} {a.id === myId && <span className="text-xs font-normal text-[#737373]">(you)</span>}
                </p>
                <p className="text-xs text-[#737373]">{a.email}</p>
              </div>
              {a.id !== myId && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() => window.confirm(`Remove admin access for ${a.email}?`) && remove.mutate(a.id)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-3">
        <input type="email" placeholder="Email of the new admin" className={`${field} max-w-sm`} value={email} onChange={e => setEmail(e.target.value)} />
        <Button disabled={!validEmail || add.isPending} onClick={() => add.mutate()}>
          {add.isPending ? 'Adding…' : 'Add admin'}
        </Button>
      </div>
    </section>
  );
}

export default Settings;
