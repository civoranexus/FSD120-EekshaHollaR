'use client';

import { useState, useEffect } from 'react';
import { FiGrid, FiUser, FiInfo, FiHome } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { residentApi } from '@/lib/api/resident';

interface UnitDetail {
  id: string;
  unit_number: string;
  floor_number: number;
  type: string;
  status: string;
  residents: {
    id: string;
    full_name: string;
    email: string;
    resident_type: string;
    is_primary_contact: boolean;
  }[];
}

export default function MyUnitPage() {
  const [units, setUnits] = useState<UnitDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyUnits = async () => {
    try {
      const response = await residentApi.getMyUnits();
      if (response.data.success) {
        setUnits(response.data.data);
      }
    } catch {
      toast.error('Failed to load unit information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUnits();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/10 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/10 rounded-2xl backdrop-blur-md"></div>
          <div className="h-64 bg-white/10 rounded-2xl backdrop-blur-md"></div>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <Card className="p-12 text-center text-slate-300">
        <FiHome size={48} className="mx-auto mb-4 text-slate-400 opacity-70" />
        <h2 className="text-2xl font-semibold mb-2 text-white">No Unit Assigned</h2>
        <p>You are not currently assigned to any unit in Society360.</p>
        <p className="text-sm mt-2 opacity-70">
          Please contact administration if this is an error.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-10 text-white">

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          My Unit Details
        </h1>
        <p className="text-slate-400">
          Information about your residence and co-residents.
        </p>
      </div>

      {units.map((unit) => (
        <div key={unit.id} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Unit Overview Glass Hero */}
          <Card className="lg:col-span-1 p-0 overflow-hidden">

            <div className="bg-gradient-to-br from-indigo-500/90 to-indigo-700/90 p-8 text-white">
              <FiGrid size={34} className="mb-4 opacity-70" />
              <h2 className="text-3xl font-bold">Unit {unit.unit_number}</h2>
              <p className="opacity-80 mt-1">
                Floor {unit.floor_number} • {unit.type}
              </p>
            </div>

            <div className="p-6 space-y-4">

              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 text-sm">Status</span>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 text-sm">Property Type</span>
                <span className="font-medium">{unit.type}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Location</span>
                <span className="font-medium">Block A (Main)</span>
              </div>

            </div>
          </Card>

          {/* Residents */}
          <div className="lg:col-span-2 space-y-6">

            <div className="flex items-center gap-2">
              <FiUser className="text-indigo-400" />
              <h2 className="text-lg font-semibold">Residents</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {unit.residents.map((resident) => (
                <Card
                  key={resident.id}
                  hover
                  className="p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold text-lg">
                    {resident.full_name[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">
                        {resident.full_name}
                      </p>
                      {resident.is_primary_contact && (
                        <Badge variant="info" className="text-[10px] px-2 py-0.5">
                          PRIMARY
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate">
                      {resident.email}
                    </p>

                    <p className="text-[10px] text-indigo-400 font-semibold uppercase mt-1">
                      {resident.resident_type.replace('_', ' ')}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Info Section */}
            <div className="pt-4 space-y-4">

              <div className="flex items-center gap-2">
                <FiInfo className="text-indigo-400" />
                <h2 className="text-lg font-semibold">
                  Residency Information
                </h2>
              </div>

              <Card className="p-6 bg-[#0b1220]/50">

                <ul className="space-y-3 text-sm text-slate-300">

                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    Maintain your profile information through account settings.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    All residents listed here have access to this unit dashboard.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    Primary contact changes require admin approval.
                  </li>

                </ul>

              </Card>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
