import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, UserCog, ArrowRight, Key } from "lucide-react";
import { motion } from "motion/react";

// Role authentication IDs (change these to your desired IDs)
const ROLE_IDS = {
  admin: "ADMIN2026",
  manager: "MANAGER2026",
  worker: "WORKER2026",
};

export function RoleSelectionPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "admin",
      title: "Admin",
      description: "Full access to all features and settings",
      icon: UserCog,
      color: "from-red-500 to-red-600",
    },
    {
      id: "manager",
      title: "Manager",
      description: "Manage inventory, orders, and team operations",
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "worker",
      title: "Worker",
      description: "View assigned tasks and update progress",
      icon: Users,
      color: "from-green-500 to-green-600",
    },
  ];

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    if (!roleId.trim()) {
      setError("Please enter your role ID");
      return;
    }

    // Verify role ID
    if (roleId !== ROLE_IDS[selectedRole]) {
      setError(`Invalid ${selectedRole} ID. Please contact your administrator.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Update user's unsafe metadata with selected role
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: selectedRole,
          roleVerified: true,
        },
      });

      console.log("Role set successfully:", selectedRole);

      // Wait for metadata to sync
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to business registration
      navigate("/register");
    } catch (error) {
      console.error("Error setting role:", error);
      setError("Failed to set role. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Select Your Role
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Choose the role that best describes your position
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <motion.button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setError("");
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-xl"
                    : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}

                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {role.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm">
                  {role.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Role ID Input */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              Enter {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} ID
            </label>
            <input
              type="text"
              value={roleId}
              onChange={(e) => {
                setRoleId(e.target.value);
                setError("");
              }}
              placeholder={`Enter your ${selectedRole} authentication ID`}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
              Contact your administrator if you don't have an ID
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </p>
          </motion.div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || !roleId || loading}
            className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
