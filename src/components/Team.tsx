import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';

const developers = [

  {
    name: "Shekhar Suman",
    role: "BTech at IIT Patna | AI/ML Engineer",
    image: "https://i.imgur.com/tQcSPpO.png",
    bio: "A creative individual with knowledge of machine learning and some development experience, blending technical skills with innovative thinking.",
    github: "https://github.com/glasspollution",
    linkedin: "https://www.linkedin.com/in/it-is-shekhar/",
    email: "mailto:shekharsumanjma001@gmail.com"
  },

  {
    name: "Jayanth Malladi",
    role: "BTech at IIT Patna | AI/ML Enthusiast | Full Stack Developer",
    image: "https://i.imgur.com/KfvyqRL.png",
    bio: "Passionate about leveraging AI, web development, and finance to create innovative and impactful solutions that address real-world challenges.",
    github: "https://github.com/JayanthMalladi",
    linkedin: "https://www.linkedin.com/in/jayanthmalladi/",
    email: "mailto:jayanthmalladi844@gmail.com"
  },

  {
    name: "Aashman Awasthi",
    role: "BTech at IIT Patna | ML Enthusiast",
    image: "https://i.imgur.com/6Nhtk4k.png",
    bio: "Enthusiastic developer with a passion for creating seamless user experiences and innovative solutions.",
    github: "https://github.com/aashuhub-prog",
    linkedin: "https://www.linkedin.com/in/aashman-awasthi-440188291/",
    email: "mailto:awasthi.aashman@gmail.com"
  }
];

export default function Team() {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">Meet Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The brilliant minds behind socialBeaver who combine AI expertise with development skills.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {developers.map((dev, index) => (
            <motion.div
              key={dev.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
                         border border-gray-100"
            >
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <img
                    src={dev.image}
                    alt={dev.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/10 to-blue-400/10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{dev.name}</h3>
                <p className="text-green-600 font-medium mb-4 text-xs">{dev.role}</p>
                <p className="text-gray-600 mb-6 text-xs leading-relaxed">{dev.bio}</p>
                
                <div className="flex justify-center gap-6">
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors
                             hover:text-green-600"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors
                             hover:text-blue-600"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={dev.email}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors
                             hover:text-purple-600"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
} 