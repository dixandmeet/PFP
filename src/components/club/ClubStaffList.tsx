"use client"

import { motion } from "framer-motion"
import { Briefcase, User } from "lucide-react"

interface StaffMember {
  id: string
  name: string
  role: string
  email?: string
}

interface Team {
  id: string
  name: string
  level?: string
  staffMembers: StaffMember[]
}

interface ClubStaffListProps {
  teams: Team[]
}

const roleColors: Record<string, string> = {
  "Head Coach": "bg-victory-100 text-victory-700",
  "Assistant Coach": "bg-pitch-100 text-pitch-700",
  "Goalkeeping Coach": "bg-amber-100 text-amber-700",
  "Scout": "bg-blue-100 text-blue-700",
  "Fitness Coach": "bg-green-100 text-green-700",
  "Director": "bg-gold-100 text-gold-700",
}

export function ClubStaffList({ teams }: ClubStaffListProps) {
  // Extraire tous les membres du staff de toutes les équipes
  const allStaff = teams.flatMap(team => 
    team.staffMembers.map(member => ({
      ...member,
      teamName: team.name,
    }))
  )

  if (allStaff.length === 0) {
    return (
      <div className="card-stadium overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-gold-50 to-gold-100/50 border-b border-gold-200">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gold-600" />
            <h3 className="font-bold text-gold-800 text-sm">Staff technique</h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-stadium-500">Aucun membre du staff renseigné</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-stadium overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-gold-50 to-gold-100/50 border-b border-gold-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gold-600" />
            <h3 className="font-bold text-gold-800 text-sm">Staff technique</h3>
          </div>
          <span className="text-xs text-stadium-500">{allStaff.length} membres</span>
        </div>
      </div>

      <div className="divide-y divide-pitch-50">
        {allStaff.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 hover:bg-pitch-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-gold-600" />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stadium-800 truncate">
                  {member.name}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    roleColors[member.role] || "bg-stadium-100 text-stadium-700"
                  }`}>
                    {member.role}
                  </span>
                  <span className="text-xs text-stadium-500">{member.teamName}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
