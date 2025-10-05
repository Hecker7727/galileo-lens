import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Github } from 'lucide-react';

const teamMembers = [
  {
    name: 'Authurv Salunkhe',
    github: 'authurv6',
    role: 'Team Lead & Owner',
    color: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-500/50'
  },
  {
    name: 'Yashaswini M',
    github: 'yashhhaswinii',
    role: 'Frontend Developer',
    color: 'from-pink-600 to-purple-600',
    borderColor: 'border-pink-500/50'
  },
  {
    name: 'Haresh Kumar',
    github: 'hxsc',
    role: 'Fullstack Developer',
    color: 'from-green-600 to-emerald-600',
    borderColor: 'border-green-500/50'
  },
  {
    name: 'Vinayaka',
    github: 'vinaysr',
    role: 'Backend Developer',
    color: 'from-orange-600 to-amber-600',
    borderColor: 'border-orange-500/50'
  },
  {
    name: 'Shaharsh.s',
    github: 'shaharshsai',
    role: 'Backend Developer',
    color: 'from-violet-600 to-purple-600',
    borderColor: 'border-violet-500/50'
  },
  {
    name: 'Sri Paul Chandran C',
    github: 'sripaul',
    role: 'Frontend Developer',
    color: 'from-indigo-600 to-blue-600',
    borderColor: 'border-indigo-500/50'
  }
];

export default function AboutUs() {
  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="h-8 w-8 text-blue-400" />
          <h3 className="text-4xl font-bold text-blue-200">Meet the Team</h3>
        </div>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          The talented individuals behind Galileo's Lenses, bringing NASA's bioscience research to life
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.github}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`bg-black/50 ${member.borderColor} backdrop-blur-sm hover:scale-105 transition-all duration-300 h-full`}>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  {/* Avatar with gradient */}
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Name */}
                  <h4 className="text-xl font-bold text-white mb-2">
                    {member.name}
                  </h4>
                  
                  {/* Role Badge */}
                  <Badge className={`bg-gradient-to-r ${member.color} text-white border-0 mb-3 px-3 py-1`}>
                    {member.role}
                  </Badge>
                  
                  {/* GitHub Link */}
                  <a
                    href={`https://github.com/${member.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  >
                    <Github className="h-4 w-4" />
                    @{member.github}
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Team Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-black/40 border border-blue-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-400 mb-2">6</div>
            <div className="text-sm text-gray-300">Team Members</div>
          </div>
          <div className="bg-black/40 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-3xl font-bold text-green-400 mb-2">608</div>
            <div className="text-sm text-gray-300">Publications Analyzed</div>
          </div>
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-400 mb-2">2025</div>
            <div className="text-sm text-gray-300">NASA Space Apps</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
