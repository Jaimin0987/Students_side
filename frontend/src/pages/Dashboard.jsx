import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, ArrowRight, Sparkles, Users, MessagesSquare, ClipboardCheck } from 'lucide-react';

export function Dashboard({ user }) {
  const cards = [
    {
      title: 'Groups',
      description: 'Join study groups to collaborate with classmates, share notes, and discuss topics together.',
      icon: Users,
      link: '/groups',
      features: ['Join or leave groups', 'Group discussions', 'Shared learning space']
    },
    {
      title: 'Study Files',
      description: 'Access and download study materials uploaded by teachers or group members for your subjects.',
      icon: Upload,
      link: '/files',
      features: ['View and download notes', 'Multiple file formats', 'Shared group resources']
    },
    {
      title: 'Assignments',
      description: 'View assigned tasks, upload your submissions, and check grades or teacher feedback.',
      icon: ClipboardCheck,
      link: '/assignments',
      features: ['Submit assignments', 'Track deadlines', 'View grades & feedback']
    },
    {
      title: 'Quiz',
      description: 'Take interactive quizzes to test your knowledge, get instant feedback, and track your progress.',
      icon: FileText,
      link: '/quiz',
      features: ['Timed quizzes', 'Instant results', 'Progress tracking']
    },
    {
      title: 'Intract',
      description: 'A student-run forum to share ideas, discuss topics, and vote on the best content.',
      icon: MessagesSquare,
      link: '/intract',
      features: ['Join communities', 'Post & discuss', 'Upvote/downvote content'],
      newTab: true
    }
  ];

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-50 mb-3">
            Welcome {user?.fullName} to Students Portal
          </h1>
          <p className="text-lg text-primary-900 dark:text-primary-100 max-w-2xl mx-auto">
            Collaborate with classmates, access learning materials, and stay organized — all in one place.
          </p>
        </div>

        {/* Main Cards – compact 2 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link
                key={index}
                to={card.link}
                target={card.newTab ? "_blank" : "_self"} // ✅ opens new tab only for Intract
                rel={card.newTab ? "noopener noreferrer" : undefined}
                className="group bg-primary-900 dark:bg-primary-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary-900 dark:border-primary-400 max-w-md mx-auto"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary-800 dark:text-primary-50" />
                  </div>

                  <h2 className="text-xl font-semibold text-primary-50 dark:text-primary-800 mb-2">
                    {card.title}
                  </h2>

                  <p className="text-sm text-primary-100 dark:text-primary-800 mb-4 leading-relaxed">
                    {card.description}
                  </p>

                  <ul className="space-y-1 mb-4 mt-auto">
                    {card.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-xs text-primary-100 dark:text-primary-800">
                        <Sparkles className="w-3 h-3 text-primary-400 dark:text-primary-800 mr-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center text-sm text-primary-100 dark:text-primary-800 font-semibold group-hover:text-primary-50 dark:group-hover:text-primary-600">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
