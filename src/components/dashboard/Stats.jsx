import React from 'react';
import PropTypes from 'prop-types';

/**
 * Stats component for displaying statistics in the dashboard
 * Can be used for both admin and volunteer dashboards
 */
const Stats = ({ stats = [] }) => {
  // Color themes for various stat cards
  const colorThemes = {
    blue: {
      border: 'border-vadm-blue',
      bg: 'bg-blue-50',
      text: 'text-blue-700'
    },
    green: {
      border: 'border-vadm-green',
      bg: 'bg-green-50',
      text: 'text-green-700'
    },
    orange: {
      border: 'border-vadm-orange',
      bg: 'bg-orange-50',
      text: 'text-orange-700'
    },
    red: {
      border: 'border-vadm-red',
      bg: 'bg-red-50',
      text: 'text-red-700'
    },
    yellow: {
      border: 'border-vadm-yellow',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700'
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700'
    },
    gray: {
      border: 'border-gray-500',
      bg: 'bg-gray-50',
      text: 'text-gray-700'
    }
  };

  // If there are no stats, return a loading placeholder
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white p-6 shadow rounded-lg border-l-4 border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="mt-2 h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="mt-1 h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const theme = colorThemes[stat.color] || colorThemes.blue;
        
        return (
          <div 
            key={index} 
            className={`bg-white p-6 shadow rounded-lg border-l-4 ${theme.border}`}
          >
            <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
            {stat.subtext && (
              <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
            )}
            {stat.trend && (
              <div className="mt-2 flex items-center">
                {stat.trend > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    {stat.trend}%
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                    </svg>
                    {Math.abs(stat.trend)}%
                  </span>
                )}
                <span className="text-gray-500 text-sm ml-1">from last month</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

Stats.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      subtext: PropTypes.string,
      color: PropTypes.oneOf(['blue', 'green', 'orange', 'red', 'yellow', 'purple', 'gray']),
      trend: PropTypes.number
    })
  )
};

export default Stats;