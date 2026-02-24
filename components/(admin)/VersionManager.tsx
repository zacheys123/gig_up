"use client";
import { useState } from "react";
import { Play, Pause, Settings, Rocket } from "lucide-react";

export type VersionStatus = "legacy" | "active" | "beta";
export type PlatformVersion = "v1.0" | "v2.0" | "v3.0";
export interface VersionDetails {
  name: string;
  status: VersionStatus;
  users: string;
  features: string[];
}

export interface VersionData {
  [version: string]: VersionDetails;
}
export function VersionManager() {
  const [activeVersion, setActiveVersion] = useState("v2.0");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const VERSION_DETAILS = {
    "v1.0": {
      name: "Basic Platform",
      status: "legacy",
      users: "All existing users",
      features: ["Basic gig posting", "Messaging", "Profiles"],
    },
    "v2.0": {
      name: "Producer Edition",
      status: "active",
      users: "All users",
      features: [
        "Multi-vendor events",
        "Video portfolios",
        "Advanced analytics",
      ],
    },
    "v3.0": {
      name: "Collaboration Suite",
      status: "beta",
      users: "Beta testers only",
      features: ["Live streaming", "Royalty tracking", "Virtual events"],
    },
  };

  const activateVersion = async (version: string) => {
    // Update the current version
    await fetch("/api/admin/set-version", {
      method: "POST",
      body: JSON.stringify({ version }),
    });

    setActiveVersion(version);
    alert(`Platform version switched to ${VERSION_DETAILS[version].name}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Rocket className="w-8 h-8 text-blue-500" />
        <h1 className="text-xl font-bold">Platform Version Manager</h1>
      </div>

      {/* Current Version Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Current Active Version</h3>
            <p className="text-gray-600">
              {VERSION_DETAILS[activeVersion].name}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Version Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(VERSION_DETAILS).map(([version, details]) => (
          <div
            key={version}
            className={`border rounded-lg p-4 ${
              version === activeVersion
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{details.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  details.status === "active"
                    ? "bg-green-100 text-green-800"
                    : details.status === "beta"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {details.status.toUpperCase()}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{details.users}</p>

            <ul className="space-y-2 mb-4">
              {details.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => activateVersion(version)}
              disabled={version === activeVersion}
              className={`w-full py-2 px-4 rounded text-sm font-medium ${
                version === activeVersion
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {version === activeVersion ? "Active" : "Activate Version"}
            </button>
          </div>
        ))}
      </div>

      {/* Maintenance Mode */}
      <div className="border rounded-lg p-4 bg-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Maintenance Mode</h3>
            <p className="text-sm text-gray-600">
              Put AI assistant in maintenance mode during updates
            </p>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded ${
              maintenanceMode
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {maintenanceMode ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {maintenanceMode ? "Maintenance Active" : "Enable Maintenance"}
          </button>
        </div>
      </div>

      {/* Version Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xl font-bold text-blue-600">v1.0</div>
          <div className="text-sm text-gray-600">Legacy Users</div>
          <div className="text-lg font-semibold">1,234</div>
        </div>
        <div className="bg-white border rounded-lg p-4 ring-2 ring-green-500">
          <div className="text-xl font-bold text-green-600">v2.0</div>
          <div className="text-sm text-gray-600">Active Users</div>
          <div className="text-lg font-semibold">4,567</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xl font-bold text-yellow-600">v3.0</div>
          <div className="text-sm text-gray-600">Beta Testers</div>
          <div className="text-lg font-semibold">89</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xl font-bold text-purple-600">Total</div>
          <div className="text-sm text-gray-600">All Versions</div>
          <div className="text-lg font-semibold">5,890</div>
        </div>
      </div>
    </div>
  );
}
