import http from 'http';

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 Starting ImpactHub Automated API Test Suite...\n');

  try {
    // 1. Health Check
    console.log('1. Testing GET /health ...');
    const health = await request('/health');
    console.log('   Status:', health.status, '| App:', health.data.app);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Demo Login as Student (Ali Khan)
    console.log('2. Testing POST /auth/demo-login (Student) ...');
    const studentLogin = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'student' },
    });
    console.log('   Status:', studentLogin.status, '| User:', studentLogin.data.user.name, '| Points:', studentLogin.data.user.points);
    const studentToken = studentLogin.data.token;
    if (!studentToken) throw new Error('Student login failed');

    // 3. Demo Login as Manager (Usman Ghani)
    console.log('3. Testing POST /auth/demo-login (Manager) ...');
    const managerLogin = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'manager' },
    });
    console.log('   Status:', managerLogin.status, '| User:', managerLogin.data.user.name);
    const managerToken = managerLogin.data.token;
    if (!managerToken) throw new Error('Manager login failed');

    // 4. Demo Login as Admin (Muhammad Tariq)
    console.log('4. Testing POST /auth/demo-login (Admin) ...');
    const adminLogin = await request('/auth/demo-login', {
      method: 'POST',
      body: { role: 'admin' },
    });
    console.log('   Status:', adminLogin.status, '| User:', adminLogin.data.user.name);
    const adminToken = adminLogin.data.token;
    if (!adminToken) throw new Error('Admin login failed');

    // 5. Get Projects with Search & Filter
    console.log('5. Testing GET /projects (Search: Rawalpindi, Category: Environment) ...');
    const projects = await request('/projects?search=Rawalpindi&category=Environment');
    console.log('   Status:', projects.status, '| Projects Count:', projects.data.count);
    if (projects.data.projects.length === 0) throw new Error('Project search returned 0 items');
    const firstProject = projects.data.projects[0];
    console.log('   First Project:', firstProject.title, '| Impact Score:', firstProject.impactScore);

    // 6. Get Leaderboard
    console.log('6. Testing GET /leaderboard ...');
    const leaderboard = await request('/leaderboard');
    console.log('   Status:', leaderboard.status, '| Top Volunteer:', leaderboard.data.leaderboard[0]?.name, '| Points:', leaderboard.data.leaderboard[0]?.points);
    console.log('   Top Impact Project:', leaderboard.data.topProjects[0]?.title, '| Score:', leaderboard.data.topProjects[0]?.impactScore);

    // 7. Get Tasks for Project
    console.log('7. Testing GET /tasks/project/:id ...');
    const tasks = await request(`/tasks/project/${firstProject._id}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('   Status:', tasks.status, '| Tasks Count:', tasks.data.count);

    // 8. Admin Stats
    console.log('8. Testing GET /admin/stats (Admin Only) ...');
    const adminStats = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   Status:', adminStats.status, '| Total Users:', adminStats.data.stats.users.total, '| Total Projects:', adminStats.data.stats.projects.total);

    // 9. Role-Guard Test: Student accessing Admin API (Must return 403)
    console.log('9. Testing Security: Student accessing GET /admin/stats (Expect 403 Forbidden) ...');
    const forbiddenTest = await request('/admin/stats', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('   Status:', forbiddenTest.status, '| Message:', forbiddenTest.data.message);
    if (forbiddenTest.status !== 403) throw new Error('Security check failed: Student accessed admin route!');

    console.log('\n🎉 ALL 9 TEST SUITES PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exit(1);
  }
}

// Allow time for server to be active
setTimeout(runTests, 2000);
