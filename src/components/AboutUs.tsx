import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Github, Star, Sparkles } from 'lucide-react';

const teamMembers = [
  {
    name: 'Authurv Salunkhe',
    github: 'authurv6',
    role: 'Team Lead & Owner',
    color: 'blue',
    icon: '👨‍💼'
  },
  {
    name: 'Yashaswini M',
    github: 'yashhhaswinii',
    role: 'Frontend Developer',
    color: 'pink',
    icon: '👩‍💻'
  },
  {
    name: 'Haresh Kumar',
    github: 'hxsc',
    role: 'Fullstack Developer',
    color: 'green',
    icon: '👨‍💻'
  },
  {
    name: 'Vinayaka',
    github: 'vinaysr',
    role: 'Backend Developer',
    color: 'orange',
    icon: '🧑‍💻'
  },
  {
    name: 'Shaharsh.s',
    github: 'shaharshsai',
    role: 'Backend Developer',
    color: 'purple',
    icon: '👨‍💻'
  },
  {
    name: 'Sri Paul Chandran C',
    github: 'sripaul',
    role: 'Frontend Developer',
    color: 'indigo',
    icon: '👨‍💻'
  }
];

const colorSchemes = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    hover: 'hover:border-blue-400/60 hover:bg-blue-500/20',
    glow: 'shadow-blue-500/20'
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    hover: 'hover:border-pink-400/60 hover:bg-pink-500/20',
    glow: 'shadow-pink-500/20'
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    hover: 'hover:border-green-400/60 hover:bg-green-500/20',
    glow: 'shadow-green-500/20'
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    hover: 'hover:border-orange-400/60 hover:bg-orange-500/20',
    glow: 'shadow-orange-500/20'
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    hover: 'hover:border-purple-400/60 hover:bg-purple-500/20',
    glow: 'shadow-purple-500/20'
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    hover: 'hover:border-indigo-400/60 hover:bg-indigo-500/20',
    glow: 'shadow-indigo-500/20'
  }
};

export default function AboutUs() {
  return (
    <section className="container mx-auto px-4 py-20 relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block mb-4"
        >
          <Badge className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border-blue-400/30 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 mr-2 inline" />
            Our Amazing Team
          </Badge>
        </motion.div>
        <h3 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
          Meet the Minds Behind
        </h3>
        <h4 className="text-4xl font-bold mb-6 text-white">
          Galileo's Lenses
        </h4>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
          A passionate team of developers and innovators working together to make NASA's bioscience research 
          accessible to the world through cutting-edge technology and beautiful design.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {teamMembers.map((member, index) => {
          const scheme = colorSchemes[member.color as keyof typeof colorSchemes];
          return (
            <motion.div
              key={member.github}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className={`relative overflow-hidden backdrop-blur-md ${scheme.bg} ${scheme.border} ${scheme.hover} border-2 transition-all duration-300 h-full group shadow-lg ${scheme.glow} hover:shadow-2xl`}>
                {/* Animated background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${member.color === 'blue' ? 'from-blue-600/0 to-cyan-600/0' : 
                  member.color === 'pink' ? 'from-pink-600/0 to-purple-600/0' :
                  member.color === 'green' ? 'from-green-600/0 to-emerald-600/0' :
                  member.color === 'orange' ? 'from-orange-600/0 to-amber-600/0' :
                  member.color === 'purple' ? 'from-purple-600/0 to-violet-600/0' :
                  'from-indigo-600/0 to-blue-600/0'} 
                  group-hover:from-${member.color}-600/10 group-hover:to-${member.color}-800/10 transition-all duration-300`}></div>
                
                <CardContent className="pt-8 pb-8 px-6 relative z-10">
                  <div className="flex flex-col items-center text-center">
                    {/* Icon/Emoji Avatar */}
                    <motion.div 
                      className={`text-6xl mb-4 ${scheme.text} filter drop-shadow-lg`}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {member.icon}
                    </motion.div>
                    
                    {/* Name */}
                    <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all">
                      {member.name}
                    </h4>
                    
                    {/* Role */}
                    <p className={`text-sm font-medium ${scheme.text} mb-4`}>
                      {member.role}
                    </p>
                    
                    {/* Divider */}
                    <div className={`w-16 h-1 ${scheme.bg} rounded-full mb-4`}></div>
                    
                    {/* GitHub Link */}
                    <motion.a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scheme.bg} ${scheme.border} border ${scheme.text} hover:bg-white/5 transition-all text-sm font-medium group/link`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Github className="h-4 w-4 group-hover/link:animate-pulse" />
                      <span>@{member.github}</span>
                    </motion.a>
                  </div>
                </CardContent>

                {/* Corner decoration */}
                <div className={`absolute top-0 right-0 w-20 h-20 ${scheme.bg} rounded-bl-full opacity-30`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 ${scheme.bg} rounded-tr-full opacity-30`}></div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Team Stats with new style */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-20 relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-900/60 via-blue-900/40 to-purple-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <motion.div 
                  className="text-5xl font-bold text-transparent bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  6
                </motion.div>
                <div className="text-gray-400 font-medium">Talented Team Members</div>
              </div>
              <div className="text-center border-l border-r border-white/10">
                <motion.div 
                  className="text-5xl font-bold text-transparent bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  608
                </motion.div>
                <div className="text-gray-400 font-medium">Publications Analyzed</div>
              </div>
              <div className="text-center">
                <motion.div 
                  className="text-5xl font-bold text-transparent bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  🚀
                </motion.div>
                <div className="text-gray-400 font-medium">NASA Space Apps 2025</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
