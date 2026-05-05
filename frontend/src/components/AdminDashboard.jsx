import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaUsers, FaPaw, FaCalendarCheck, FaRupeeSign, FaCheck, FaTimes, FaClock, FaUserMd, FaStore, FaDog } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, usersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/users/stats`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/users/pending`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/users`, config),
      ]);
      setStats(statsRes.data);
      setPendingUsers(pendingRes.data);
      setAllUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/approve`, {}, config);
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
      setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
      alert('User approved successfully ✅');
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject and permanently remove this user?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}/reject`, config);
      setPendingUsers(pendingUsers.filter(u => u._id !== id));
      setAllUsers(allUsers.filter(u => u._id !== id));
      alert('User rejected and removed');
    } catch (error) {
      console.error(error);
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Veterinarian': return <FaUserMd className="text-blue-400" />;
      case 'Service Provider': return <FaStore className="text-purple-400" />;
      case 'Pet Owner': return <FaDog className="text-amber-400" />;
      default: return <FaUsers className="text-gray-400" />;
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      'Admin': 'bg-red-500/20 text-red-400',
      'Veterinarian': 'bg-blue-500/20 text-blue-400',
      'Service Provider': 'bg-purple-500/20 text-purple-400',
      'Pet Owner': 'bg-amber-500/20 text-amber-400',
    };
    return styles[role] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards — all real from DB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={<FaUsers />} color="amber" />
        <StatCard title="Active Pets" value={stats?.totalPets ?? 0} icon={<FaPaw />} color="blue" />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} icon={<FaCalendarCheck />} color="purple" />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
          icon={<FaRupeeSign />}
          color="amber"
          sub="From completed bookings"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {['overview', 'pending', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 capitalize text-sm font-semibold rounded-t-lg transition ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'pending' ? `Pending (${pendingUsers.length})` : tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-5">Users by Role</h3>
            <div className="space-y-4">
              {stats?.roleCounts?.map(rc => (
                <div key={rc._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(rc._id)}
                    <span className="text-sm text-gray-300">{rc._id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min((rc.count / (stats?.totalUsers || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-6 text-right">{rc.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-5">Platform Summary</h3>
            <div className="space-y-4">
              <SummaryRow label="Pending Approvals" value={stats?.pendingApprovals ?? 0} highlight={stats?.pendingApprovals > 0} />
              <SummaryRow label="Registered Users" value={stats?.totalUsers ?? 0} />
              <SummaryRow label="Pets Registered" value={stats?.totalPets ?? 0} />
              <SummaryRow label="Total Bookings" value={stats?.totalBookings ?? 0} />
              <SummaryRow label="Revenue (Completed)" value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`} />
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaClock className="text-amber-500" /> Pending Approvals
          </h3>
          {pendingUsers.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">✅ No pending approvals — all clear!</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(pUser => (
                <div key={pUser._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-white/10 rounded-lg bg-black/20 gap-3">
                  <div>
                    <p className="font-bold">{pUser.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(pUser.role)}`}>{pUser.role}</span>
                    <p className="text-xs text-gray-500 mt-1">{pUser.email}</p>
                    <p className="text-xs text-gray-600">Joined: {new Date(pUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(pUser._id)} className="flex items-center gap-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/40 transition text-sm font-bold">
                      <FaCheck /> Approve
                    </button>
                    <button onClick={() => handleReject(pUser._id)} className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition text-sm font-bold">
                      <FaTimes /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaUsers className="text-amber-500" /> All Users ({allUsers.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-left">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Verified</th>
                  <th className="pb-3">Approved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allUsers.map(u => (
                  <tr key={u._id} className="hover:bg-white/5 transition">
                    <td className="py-3 pr-4 font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadge(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={u.isVerified ? 'text-emerald-400' : 'text-red-400'}>
                        {u.isVerified ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={u.isApproved ? 'text-emerald-400' : 'text-amber-400'}>
                        {u.isApproved ? '✓ Yes' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color, sub }) => (
  <div className={`glass-card p-6 border-b-4 ${
    color === 'amber' ? 'border-amber-500' :
    color === 'blue' ? 'border-blue-500' :
    color === 'purple' ? 'border-purple-500' : 'border-amber-500'
  }`}>
    <div className="flex justify-between items-start mb-2">
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <span className={`text-${color}-500 text-xl opacity-80`}>{icon}</span>
    </div>
    <p className="text-3xl font-extrabold text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

const SummaryRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</span>
  </div>
);

export default AdminDashboard;
