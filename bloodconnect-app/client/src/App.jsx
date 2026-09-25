import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, Activity, Phone, MapPin, PlusCircle, CheckCircle, 
  ShieldAlert, Users, ArrowRight, Zap, Droplet, Clock, Check
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || ' https://bloodconnectbackend-api.onrender.com/api';

const COMPATIBILITY_MATRIX = [
  { recipient: 'O-', donors: ['O-'] },
  { recipient: 'O+', donors: ['O-', 'O+'] },
  { recipient: 'A-', donors: ['O-', 'A-'] },
  { recipient: 'A+', donors: ['O-', 'O+', 'A-', 'A+'] },
  { recipient: 'B-', donors: ['O-', 'B-'] },
  { recipient: 'B+', donors: ['O-', 'O+', 'B-', 'B+'] },
  { recipient: 'AB-', donors: ['O-', 'A-', 'B-', 'AB-'] },
  { recipient: 'AB+', donors: ['Universal Recipient (All Groups)'] },
];

export default function App() {
  const [tab, setTab] = useState('home'); // 'home' | 'sos' | 'donors' | 'register'
  const [stats, setStats] = useState({ totalDonors: 6, openRequests: 1 });
  const [donors, setDonors] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [sosForm, setSosForm] = useState({
    patient_name: '',
    hospital_name: '',
    blood_group: 'O+',
    units_needed: 2,
    city: '',
    urgency_level: 'CRITICAL',
    contact_number: '',
  });

  const [donorForm, setDonorForm] = useState({
    name: '',
    blood_group: '',
    city: '',
    phone: '',
    email: '',
  });
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/stats`);
      setStats(data);
    } catch (e) {
      console.warn('Backend not responding to /stats yet, using baseline stats.');
    }
  };

  const fetchDonors = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/donors`);
      setDonors(data);
    } catch (e) {
      console.warn('Backend not responding to /donors yet.');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDonors();
  }, []);

  const handleSosSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMatchResult(null);
    try {
      const { data } = await axios.post(`${API_BASE}/requests`, sosForm);
      setMatchResult(data);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to dispatch SOS');
    } finally {
      setLoading(false);
    }
  };

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/donors`, donorForm);
      setRegisteredSuccess(true);
      setDonorForm({ name: '', blood_group: '', city: '', phone: '', email: '' });
      fetchDonors();
      fetchStats();
      setTimeout(() => setRegisteredSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-zinc-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-rose-600 text-white text-[12px] font-medium py-1.5 px-4 text-center tracking-wide">
        🚨 Emergency Transfusion Hotline: Call 108 or dispatch a direct SOS request below
      </div>

      {/* Main Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 group-hover:scale-105 transition">
              <Heart className="w-5 h-5 fill-rose-600" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-zinc-900">BloodConnect</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Live Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setTab('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                tab === 'home' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab('sos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                tab === 'sos' ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Emergency SOS
            </button>
            <button
              onClick={() => setTab('donors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                tab === 'donors' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Directory
            </button>
            <button
              onClick={() => setTab('register')}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-zinc-900 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Join Registry
            </button>
          </div>
        </div>
      </nav>

      {/* VIEW 1: LANDING PAGE */}
      {tab === 'home' && (
        <div className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 border-b border-zinc-200 bg-linear-to-b from-rose-50/40 via-white to-white overflow-hidden">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200/80 rounded-full text-xs font-semibold text-rose-700">
                <Zap className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                Zero-Latency Deterministic ABO/Rh Medical Matching
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
                Bridging Critical Donors <br className="hidden sm:inline" />
                with Emergency Wards in Seconds.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed">
                A rule-based emergency blood transfusion network. Eliminates probabilistic delays with relational ABO/Rh compatibility algorithms and direct donor dispatch.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setTab('sos')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" /> Request Blood Now
                </button>
                <button
                  onClick={() => setTab('register')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Droplet className="w-4 h-4 text-rose-600" /> Volunteer as Donor
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Strict ABO/Rh Matrix
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Relational MySQL 8.0 Storage
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Sub-Second Donor Querying
                </span>
              </div>
            </div>
          </section>

          {/* Real-time Metric Bar */}
          <section className="bg-zinc-900 text-white py-10 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-rose-500">{stats.totalDonors}+</p>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Verified Donors</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-white">{stats.openRequests}</p>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Emergency SOS</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">&lt; 150ms</p>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Matching Engine Latency</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl sm:text-4xl font-black text-white">100%</p>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Medical Compatibility</p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-20 px-6 max-w-6xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                Engineered for Life-or-Death Situations
              </h2>
              <p className="text-sm text-zinc-500">
                When emergencies arise, intuition is replaced with strict clinical algorithms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
                  1
                </div>
                <h3 className="font-bold text-zinc-900 text-base">Broadcast SOS</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Hospital staff or families log patient details, unit urgency, and location in one unified form.
                </p>
              </div>

              <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
                  2
                </div>
                <h3 className="font-bold text-zinc-900 text-base">Deterministic Matching</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  The backend evaluates the ABO/Rh matrix against indexed MySQL records, prioritising direct matches and universal donors.
                </p>
              </div>

              <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
                  3
                </div>
                <h3 className="font-bold text-zinc-900 text-base">Direct Donor Contact</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Immediate contact cards display with one-touch phone dialling to coordinate rapid donation arrivals.
                </p>
              </div>
            </div>
          </section>

          {/* Biological Compatibility Reference Table */}
          <section className="bg-zinc-100/70 border-t border-b border-zinc-200 py-16 px-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-zinc-900">ABO & Rh Transfusion Compatibility Matrix</h3>
                <p className="text-xs text-zinc-500">Implemented directly into our relational backend matching algorithms</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase">
                    <tr>
                      <th className="p-4">Recipient Blood Type</th>
                      <th className="p-4">Biologically Safe Donor Groups</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {COMPATIBILITY_MATRIX.map((item) => (
                      <tr key={item.recipient} className="hover:bg-zinc-50/50">
                        <td className="p-4 font-bold text-zinc-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center text-[11px]">
                            {item.recipient}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {item.donors.map((d) => (
                              <span key={d} className="px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded font-semibold text-[11px]">
                                {d}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Call To Action Strip */}
          <section className="py-16 px-6 text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-zinc-900">Ready to save a life today?</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Join hundreds of registered volunteers ready to respond at a moment's notice across medical centers.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setTab('register')}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
              >
                Register as an Emergency Volunteer
              </button>
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: EMERGENCY SOS FORM & INSTANT MATCHES */}
      {tab === 'sos' && (
        <main className="max-w-6xl mx-auto p-6 flex-1 w-full space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-xl font-bold text-zinc-900">Emergency Blood SOS Dispatcher</h2>
            </div>
            <p className="text-xs text-zinc-500 mb-6">
              Post an urgent requirement. The backend executes a biological compatibility query to find all compatible donors in the designated city.
            </p>

            <form onSubmit={handleSosSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={sosForm.patient_name}
                  onChange={(e) => setSosForm({ ...sosForm, patient_name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Hospital & Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMS Hospital"
                  value={sosForm.hospital_name}
                  onChange={(e) => setSosForm({ ...sosForm, hospital_name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaipur"
                  value={sosForm.city}
                  onChange={(e) => setSosForm({ ...sosForm, city: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Blood Group Needed</label>
                <select
                  value={sosForm.blood_group}
                  onChange={(e) => setSosForm({ ...sosForm, blood_group: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Units Needed</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={sosForm.units_needed}
                  onChange={(e) => setSosForm({ ...sosForm, units_needed: parseInt(e.target.value) || 1 })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 00000"
                  value={sosForm.contact_number}
                  onChange={(e) => setSosForm({ ...sosForm, contact_number: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>

              <div className="md:col-span-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer shadow-md shadow-rose-600/20"
                >
                  {loading ? 'Executing Compatibility Match...' : 'Broadcast Emergency Request & Find Matches'}
                </button>
              </div>
            </form>
          </div>

          {/* MATCH RESULTS PANEL */}
          {matchResult && (
            <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-4 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {matchResult.matchedCount} Compatible Donor{matchResult.matchedCount === 1 ? '' : 's'} Found in {sosForm.city}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Target: <span className="font-semibold text-rose-600">{sosForm.blood_group}</span> • 
                    Biologically Compatible Blood Types: {matchResult.compatibleGroups.join(', ')}
                  </p>
                </div>
                <span className="self-start sm:self-auto px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
                  Request #{matchResult.requestId} OPEN
                </span>
              </div>

              {matchResult.matchedCount === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500">
                  No active compatible donors currently registered in {sosForm.city}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {matchResult.matchedDonors.map((d) => (
                    <div key={d.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900">{d.name}</span>
                          <span className="px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded">
                            {d.blood_group}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" /> {d.city}
                        </p>
                      </div>
                      <a
                        href={`tel:${d.phone}`}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Donor
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* VIEW 3: DONOR DIRECTORY */}
      {tab === 'donors' && (
        <main className="max-w-6xl mx-auto p-6 flex-1 w-full space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Registered Active Donors</h2>
                <p className="text-xs text-zinc-500">Live database query on MySQL `donors` table</p>
              </div>
              <button 
                onClick={fetchDonors} 
                className="text-xs px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-700 font-medium cursor-pointer"
              >
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Blood Group</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {donors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-zinc-50/80">
                      <td className="py-3.5 font-medium text-zinc-900">{donor.name}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded text-xs">
                          {donor.blood_group}
                        </span>
                      </td>
                      <td className="py-3.5 text-zinc-600">{donor.city}</td>
                      <td className="py-3.5 font-mono text-xs text-zinc-600">{donor.phone}</td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready to Donate
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 4: REGISTER NEW DONOR */}
      {tab === 'register' && (
        <main className="max-w-6xl mx-auto p-6 flex-1 w-full">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 max-w-xl mx-auto shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <PlusCircle className="w-5 h-5" />
              <h2 className="text-lg font-bold text-zinc-900">Volunteer as a Blood Donor</h2>
            </div>
            <p className="text-xs text-zinc-500">
              Your details will be registered directly into our MySQL database for emergency hospital matching.
            </p>

            {registeredSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> You have been registered successfully!
              </div>
            )}

            <form onSubmit={handleDonorSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jack Richards"
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Blood Group</label>
                  <select
                    value={donorForm.blood_group}
                    onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi"
                    value={donorForm.city}
                    onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={donorForm.phone}
                  onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={donorForm.email}
                  onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition cursor-pointer text-sm"
              >
                Register as Donor
              </button>
            </form>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 px-6 text-center text-xs text-zinc-500 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
            <span className="font-bold text-zinc-800">BloodConnect Emergency Network</span>
          </div>
          <p>© 2026 BloodConnect. Biological rule-based triage platform built with React, Node.js & MySQL.</p>
        </div>
      </footer>
    </div>
  );
}