-- ============================================================
-- MJ NEXUS — Sample data (run ONCE after schema.sql)
-- Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run (on conflict do nothing).
-- ============================================================

insert into public.tasks (id,title,assignee_id,assigner_id,team,status,priority,due,tag,submission_id) values
('t1','Draft Q3 social content calendar','i1','l1','Growth','In Progress','High','Jun 28','Content',null),
('t2','Launch landing-page hero A/B test','i2','l1','Growth','Submitted','High','Jun 27','Growth','sub1'),
('t3','Design brand refresh deck','i3','l2','Brand','Approved','Low','Jun 24','Brand','sub2'),
('t4','Edit recruitment highlight reel','i4','l2','Brand','In Progress','Medium','Jun 28','Content',null),
('t5','Build sales outreach sequence','i5','l3','Revenue','To Do','High','Jun 30','Revenue',null),
('t6','Update CRM lead scoring model','i6','l3','Revenue','Submitted','Medium','Jun 29','Revenue','sub3'),
('t7','Prepare onboarding kit v2','i7','h1','People Ops','In Progress','Medium','Jul 01','People Ops',null),
('t8','Screen 20 marketing applicants','i8','h1','People Ops','To Do','High','Jun 27','Recruitment',null),
('t9','Competitor SEO audit','i1','l1','Growth','To Do','Medium','Jul 02','Growth',null),
('t10','Weekly performance report','i2','l1','Growth','In Progress','Low','Jun 30','Analytics',null)
on conflict (id) do nothing;

insert into public.submissions (id,task_id,intern_id,note,files,status,review_note,submitted_at) values
('sub1','t2','i2','A/B test is live — variant B lifted CTR by 14%. Dashboard screenshot attached.','[{"name":"ab-test-results.png","size":184320,"type":"image/png"}]'::jsonb,'Pending Review',null,'2026-06-26'),
('sub2','t3','i3','Final brand refresh deck v3 attached.','[{"name":"brand-refresh-v3.pdf","size":982400,"type":"application/pdf"}]'::jsonb,'Approved','Excellent — ship it.','2026-06-24'),
('sub3','t6','i6','Updated scoring weights and added 2 new signals.','[{"name":"crm-scoring.png","size":220160,"type":"image/png"}]'::jsonb,'Pending Review',null,'2026-06-26')
on conflict (id) do nothing;

insert into public.standups (id,intern_id,completed,priorities,challenges,date) values
('s1','i1','Shipped 6 social posts; finalized June report','Q3 calendar, competitor audit','Waiting on brand asset approvals','Today'),
('s2','i2','Launched hero A/B test; +14% CTR','Analyze variant data','Sample size still small','Today'),
('s3','i7','Screened 18 candidates; 5 shortlisted','Schedule HR interviews','Calendar conflicts with leads','Today')
on conflict (id) do nothing;

insert into public.requests (id,type,title,detail,requester_id,approver_id,status,created_at_label,decision_note) values
('r1','Deadline Extension','2-day extension on Q3 calendar','Brand assets are delayed — requesting 2 extra days to deliver the Q3 content calendar.','i1','l1','Pending','Today',null),
('r2','Leave','Leave request — 2 days','Personal leave on Jun 30 and Jul 1.','i5','l3','Pending','Today',null),
('r3','Hiring Approval','Final offer — Arjun Kumar (Growth)','Candidate cleared all rounds (interview 91, Strong Hire). Requesting management sign-off to extend the final offer.','h1','m1','Pending','Yesterday',null),
('r4','Headcount','Add 1 Brand intern for Q3','Brand team is at capacity. Requesting approval to open 1 additional Brand internship seat.','l2','m1','Pending','Yesterday',null),
('r5','Resource','Canva Pro license','Requesting a Canva Pro seat for design tasks.','i7','h1','Pending','Today',null),
('r6','Leave','Leave request — 1 day','Half-day on Jun 27.','i2','l1','Approved','2 days ago','Approved — enjoy!')
on conflict (id) do nothing;

insert into public.feedback (id,intern_id,from_id,rating,note,date) values
('f1','i1','l1',5,'Exceptional ownership leading the growth pod. Keep raising the bar.','Jun 22'),
('f2','i2','l1',4,'Strong analytical work — tighten delivery timelines slightly.','Jun 20'),
('f3','i5','l3',3,'Good effort; focus on deadline adherence this sprint.','Jun 19')
on conflict (id) do nothing;
