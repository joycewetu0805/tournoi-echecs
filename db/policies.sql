alter table users enable row level security;
alter table tournaments enable row level security;
alter table registrations enable row level security;
alter table groups enable row level security;
alter table matches enable row level security;
alter table standings enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table trophies enable row level security;
alter table audit_logs enable row level security;
alter table elo_history enable row level security;

create policy "Users can view own profile"
  on users for select using (auth.uid() = id);

create policy "Admins can view all profiles"
  on users for select using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users update own profile"
  on users for update using (auth.uid() = id);

create policy "Public read tournaments"
  on tournaments for select using (true);

create policy "Admin manage tournaments"
  on tournaments for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users create registration"
  on registrations for insert with check (auth.uid() = user_id);

create policy "Users view registration"
  on registrations for select using (auth.uid() = user_id);

create policy "Admin manage registrations"
  on registrations for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Public read groups"
  on groups for select using (true);

create policy "Admin manage groups"
  on groups for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Public read matches"
  on matches for select using (true);

create policy "Admin manage matches"
  on matches for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Public read standings"
  on standings for select using (true);

create policy "Admin manage standings"
  on standings for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users view payments"
  on payments for select using (auth.uid() = user_id);

create policy "Admin manage payments"
  on payments for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users view notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Admin manage notifications"
  on notifications for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users view trophies"
  on trophies for select using (auth.uid() = user_id);

create policy "Admin manage trophies"
  on trophies for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Admin view audit logs"
  on audit_logs for select using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Admin insert audit logs"
  on audit_logs for insert with check (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Users view own elo history"
  on elo_history for select using (auth.uid() = user_id);

create policy "Admin manage elo history"
  on elo_history for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));
