import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Github, Linkedin, Mail, Code2, Palette, Database, Server, Laptop } from 'lucide-react';

const teamMembers = [
  {
    name: 'Authurv Salunkhe',
    github: 'authurv6',
    role: 'Team Lead & Owner',
    specialty: 'Project Leadership',
    icon: Code2,
    gradient: 'from-cyan-400 via-blue-500 to-purple-600'
  },
  {
    name: 'Yashaswini M',
    github: 'yashhhaswinii',
    role: 'Frontend Developer',
    specialty: 'UI/UX Design',
    icon: Palette,
    gradient: 'from-pink-400 via-rose-500 to-red-600'
  },
  {
    name: 'Haresh Kumar',
    github: 'hxsc',
    role: 'Fullstack Developer',
    specialty: 'Full Stack Architecture',
    icon: Laptop,
    gradient: 'from-green-400 via-emerald-500 to-teal-600'
  },
  {
    name: 'Vinayaka',
    github: 'vinaysr',
    role: 'Backend Developer',
    specialty: 'API Development',
    icon: Server,
    gradient: 'from-orange-400 via-amber-500 to-yellow-600'
  },
  {
    name: 'Shaharsh.s',
    github: 'shaharshsai',
    role: 'Backend Developer',
    specialty: 'Database Design',
    icon: Database,
    gradient: 'from-violet-400 via-purple-500 to-fuchsia-600'
  },
  {
    name: 'Sri Paul Chandran C',
    github: 'sripaul',
    role: 'Frontend Developer',
    specialty: 'Component Development',
    icon: Code2,
    gradient: 'from-indigo-400 via-blue-500 to-sky-600'
  }
];

export default function AboutUs() {
  return (
    <section className="container mx-auto px-4 py-24 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Section Header */}
      <div className="text-center mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-6 text-base px-6 py-2 bg-blue-500/10 border-blue-500/30 text-blue-300">
            🌟 The Dream Team
          </Badge>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-7xl font-black mb-6"
        >
          <span className="text-white">Built by </span>
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Innovators
          </span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-400 max-w-3xl mx-auto"
        >
          Meet the talented developers and designers who brought Galileo's Lenses to life
        </motion.p>
      </div>

      {/* Team Grid - Horizontal Cards */}
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {teamMembers.map((member, index) => {
          const Icon = member.icon;
          return (
            <motion.div
              key={member.github}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 80
              }}
            >
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-white/10 backdrop-blur-xl overflow-hidden group hover:border-white/30 transition-all duration-500">
                <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                  {/* Avatar Section with Icon */}
                  <div className="relative flex-shrink-0">
                    <motion.div 
                      className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${member.gradient} p-[3px] group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                        <Icon className="w-14 h-14 text-white" strokeWidth={1.5} />
                      </div>
                    </motion.div>
                    {/* Floating dot indicator */}
                    <div className={`absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r ${member.gradient} rounded-full border-2 border-slate-900 animate-pulse`}></div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 group-hover:bg-clip-text transition-all">
                      {member.name}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                      <span className={`text-sm font-semibold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent`}>
                        {member.role}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">{member.specialty}</span>
                    </div>
                  </div>

                  {/* GitHub Link Button */}
                  <motion.a
                    href={`https://github.com/${member.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r ${member.gradient} bg-opacity-10 border border-white/10 hover:border-white/30 transition-all group/btn flex-shrink-0`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github className="w-5 h-5 text-white group-hover/btn:rotate-12 transition-transform" />
                    <div className="text-left hidden sm:block">
                      <div className="text-xs text-gray-400">GitHub</div>
                      <div className="text-sm font-semibold text-white">@{member.github}</div>
                    </div>
                    <div className="text-sm font-semibold text-white sm:hidden">
                      @{member.github}
                    </div>
                  </motion.a>
                </div>

                {/* Hover Gradient Bar */}
                <motion.div 
                  className={`h-1 bg-gradient-to-r ${member.gradient} w-0 group-hover:w-full transition-all duration-500`}
                ></motion.div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-20 relative z-10"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: 'rgba(59, 130, 246, 0.5)' }}
            >
              <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">6</div>
              <div className="text-sm text-gray-400 font-medium">Team Members</div>
            </motion.div>
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: 'rgba(34, 197, 94, 0.5)' }}
            >
              <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">608</div>
              <div className="text-sm text-gray-400 font-medium">Publications</div>
            </motion.div>
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.5)' }}
            >
              <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">5+</div>
              <div className="text-sm text-gray-400 font-medium">AI Features</div>
            </motion.div>
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: 'rgba(249, 115, 22, 0.5)' }}
            >
              <div className="text-4xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">2025</div>
              <div className="text-sm text-gray-400 font-medium">Space Apps</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
