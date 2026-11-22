"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  UserCheck,
  LogIn,
  Mail,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { getAdminUsers, AdminUser, AdminUsersStats } from "@/lib/admin/users/queries";

function GoogleIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "Never logged in";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 30) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatExactDate(dateString: string | null): string {
  if (!dateString) return "Never logged in";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatJoinedDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUsersStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & search state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [providerFilter, setProviderFilter] = useState<"all" | "google" | "email">("all");
  const [sortBy, setSortBy] = useState<"recent_login" | "newest" | "oldest" | "name">("recent_login");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const fetchUsers = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminUsers();
      setUsers(data.users);
      setStats(data.stats);
    } catch (err: any) {
      console.error("Error loading users:", err);
      setError(err.message || "Failed to load users list");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = u.name.toLowerCase().includes(q);
          const matchesEmail = u.email.toLowerCase().includes(q);
          if (!matchesName && !matchesEmail) return false;
        }

        // Role filter
        if (roleFilter !== "all" && u.role !== roleFilter) {
          return false;
        }

        // Provider filter
        if (providerFilter !== "all") {
          const isGoogle = u.provider.toLowerCase().includes("google");
          if (providerFilter === "google" && !isGoogle) return false;
          if (providerFilter === "email" && isGoogle) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "recent_login") {
          if (!a.lastSignInAt && !b.lastSignInAt) return 0;
          if (!a.lastSignInAt) return 1;
          if (!b.lastSignInAt) return -1;
          return new Date(b.lastSignInAt).getTime() - new Date(a.lastSignInAt).getTime();
        }
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [users, searchQuery, roleFilter, providerFilter, sortBy]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, providerFilter, sortBy, pageSize]);

  // Export CSV
  const handleExportCsv = () => {
    if (filteredUsers.length === 0) return;

    const headers = ["ID", "Name", "Email", "Role", "Provider", "Subscription", "Last Sign In", "Joined At"];
    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.provider}"`,
      `"${u.subscriptionStatus}"`,
      `"${u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : "Never"}"`,
      `"${new Date(u.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ux-with-motion-users-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F9FB] overflow-hidden">
      {/* Top Header */}
      <header className="h-[88px] border-b border-[#DEE1E4] px-8 flex items-center justify-between shrink-0 bg-white">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-title font-semibold text-[24px] text-[#1F2123]">Users</h1>
            <span className="bg-[#EEF1F4] text-[#626467] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {users.length} Total
            </span>
          </div>
          <p className="text-xs text-[#7D7F82] mt-0.5">
            Users who have registered and logged into UX With Motion platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-white border border-[#DEE1E4] hover:bg-[#F7F9FB] text-[#454545] px-4 py-2 rounded-[44px] text-xs font-medium transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh user list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#C05D00]" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-2 bg-[#1F2123] hover:opacity-90 text-white px-4 py-2 rounded-[44px] text-xs font-medium transition-opacity shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        {/* Error Notice */}
        {error && (
          <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => fetchUsers()}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[16px] p-5 flex items-center gap-4 shadow-2xs">
            <div className="size-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#7D7F82]">Total Registered</p>
              <p className="text-2xl font-bold text-[#1F2123] mt-0.5">
                {isLoading ? "-" : stats?.totalUsers || 0}
              </p>
            </div>
          </div>

          <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[16px] p-5 flex items-center gap-4 shadow-2xs">
            <div className="size-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 shrink-0">
              <LogIn className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#7D7F82]">Active (Last 30d)</p>
              <p className="text-2xl font-bold text-[#1F2123] mt-0.5">
                {isLoading ? "-" : stats?.activeRecently || 0}
              </p>
            </div>
          </div>

          <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[16px] p-5 flex items-center gap-4 shadow-2xs">
            <div className="size-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#C05D00] shrink-0">
              <GoogleIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#7D7F82]">Google Sign-ins</p>
              <p className="text-2xl font-bold text-[#1F2123] mt-0.5">
                {isLoading ? "-" : stats?.googleUsers || 0}
              </p>
            </div>
          </div>

          <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[16px] p-5 flex items-center gap-4 shadow-2xs">
            <div className="size-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#7D7F82]">Platform Admins</p>
              <p className="text-2xl font-bold text-[#1F2123] mt-0.5">
                {isLoading ? "-" : stats?.adminUsers || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Controls Card */}
        <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[16px] p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-2xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D7F82]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-[40px] pl-10 pr-4 bg-white border border-[#DEE1E4] rounded-[8px] text-sm text-[#1F2123] placeholder-[#7D7F82] focus:outline-none focus:border-[#C05D00] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7D7F82] hover:text-[#1F2123]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="h-[40px] px-3 bg-white border border-[#DEE1E4] rounded-[8px] text-xs font-medium text-[#454545] focus:outline-none focus:border-[#C05D00] cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins only</option>
              <option value="user">Regular Users</option>
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as any)}
              className="h-[40px] px-3 bg-white border border-[#DEE1E4] rounded-[8px] text-xs font-medium text-[#454545] focus:outline-none focus:border-[#C05D00] cursor-pointer"
            >
              <option value="all">All Providers</option>
              <option value="google">Google OAuth</option>
              <option value="email">Email</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-[40px] px-3 bg-white border border-[#DEE1E4] rounded-[8px] text-xs font-medium text-[#454545] focus:outline-none focus:border-[#C05D00] cursor-pointer"
            >
              <option value="recent_login">Sort: Recent Login</option>
              <option value="newest">Sort: Newest Joined</option>
              <option value="oldest">Sort: Oldest Joined</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-[#FBFCFD] border border-[#DEE1E4] rounded-[16px] overflow-hidden shadow-2xs flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EEF1F4]/70 border-b border-[#DEE1E4] text-[11px] font-semibold text-[#7D7F82] uppercase tracking-[0.5px]">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Joined Platform</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE1E4]/60 text-sm">
                {isLoading ? (
                  // Loading Skeletons
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-[#EEF1F4]" />
                          <div className="space-y-1.5">
                            <div className="w-32 h-4 bg-[#EEF1F4] rounded" />
                            <div className="w-48 h-3 bg-[#EEF1F4] rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 h-5 bg-[#EEF1F4] rounded-full" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-16 h-5 bg-[#EEF1F4] rounded-full" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-24 h-4 bg-[#EEF1F4] rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-20 h-4 bg-[#EEF1F4] rounded" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="w-16 h-5 bg-[#EEF1F4] rounded-full ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#7D7F82]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="size-10 text-[#CBCED1]" />
                        <p className="font-medium text-base text-[#454545]">No users found</p>
                        <p className="text-xs max-w-sm text-[#7D7F82]">
                          {searchQuery
                            ? `No users match "${searchQuery}". Try clearing search or filters.`
                            : "No user accounts have logged in yet."}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setRoleFilter("all");
                              setProviderFilter("all");
                            }}
                            className="mt-2 text-xs text-[#C05D00] hover:underline font-semibold"
                          >
                            Reset all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const isGoogle = user.provider.toLowerCase().includes("google");
                    const isAdmin = user.role === "admin";
                    const isRecentLogin =
                      user.lastSignInAt &&
                      Date.now() - new Date(user.lastSignInAt).getTime() < 7 * 24 * 60 * 60 * 1000;

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-white transition-colors group"
                      >
                        {/* User Identity Column */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 rounded-full overflow-hidden bg-[#EEF1F4] border border-[#DEE1E4] flex items-center justify-center shrink-0">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="font-semibold text-xs text-[#454545] uppercase">
                                  {user.name.charAt(0) || "U"}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-[#1F2123] truncate max-w-[200px]" title={user.name}>
                                  {user.name}
                                </p>
                                {isAdmin && (
                                  <span className="bg-[#ffcea2] text-[#c05d00] text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#7D7F82] truncate max-w-[240px]" title={user.email}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Provider Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isGoogle ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-[#DEE1E4] text-[#454545] shadow-2xs">
                              <GoogleIcon className="w-3.5 h-3.5" />
                              Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-[#DEE1E4] text-[#454545] shadow-2xs">
                              <Mail className="w-3.5 h-3.5 text-[#7D7F82]" />
                              Email
                            </span>
                          )}
                        </td>

                        {/* Role Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-[#C05D00] border border-amber-200">
                              <ShieldCheck className="w-3 h-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F7F9FB] text-[#626467] border border-[#DEE1E4]">
                              <UserCheck className="w-3 h-3 text-[#7D7F82]" />
                              Member
                            </span>
                          )}
                        </td>

                        {/* Last Login Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {user.lastSignInAt ? (
                              <>
                                <span
                                  className={`size-2 rounded-full shrink-0 ${
                                    isRecentLogin ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-[#CBCED1]"
                                  }`}
                                  title={isRecentLogin ? "Logged in recently (last 7 days)" : "Inactive"}
                                />
                                <div>
                                  <p className="text-sm font-medium text-[#1F2123]">
                                    {formatRelativeTime(user.lastSignInAt)}
                                  </p>
                                  <p className="text-[11px] text-[#7D7F82]" title={formatExactDate(user.lastSignInAt)}>
                                    {formatExactDate(user.lastSignInAt)}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-[#7D7F82] italic">Never logged in</span>
                            )}
                          </div>
                        </td>

                        {/* Joined Date Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[#626467]">
                            <Calendar className="w-3.5 h-3.5 text-[#7D7F82]" />
                            <span className="text-xs font-medium">{formatJoinedDate(user.createdAt)}</span>
                          </div>
                        </td>

                        {/* Status / Verified Column */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          {user.emailConfirmed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                              Unverified
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="bg-white border-t border-[#DEE1E4] px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7D7F82]">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="font-semibold text-[#1F2123]">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
                <strong className="font-semibold text-[#1F2123]">
                  {Math.min(currentPage * pageSize, filteredUsers.length)}
                </strong>{" "}
                of <strong className="font-semibold text-[#1F2123]">{filteredUsers.length}</strong> users
              </span>

              {/* Page Size Selector */}
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-7 px-2 bg-white border border-[#DEE1E4] rounded-[6px] text-xs text-[#454545] focus:outline-none focus:border-[#C05D00] cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="size-8 rounded-[8px] border border-[#DEE1E4] bg-white flex items-center justify-center text-[#454545] hover:bg-[#F7F9FB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 font-medium text-[#1F2123]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="size-8 rounded-[8px] border border-[#DEE1E4] bg-white flex items-center justify-center text-[#454545] hover:bg-[#F7F9FB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
