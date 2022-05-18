import cn from 'classnames';
import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid';
import { ShieldCheckIcon } from '@heroicons/react/outline';

import { ApplicationSidebar, tokens } from '../shared';

type Props = {
  children: React.ReactNode;
  header: React.ReactNode;
};

export function DetailPageLayout({ children, header }: Props) {
  return (
    <>
      <div>
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <ApplicationSidebar />
        </div>

        <div className="md:pl-64 flex flex-col flex-1">
          {header}
          <main className={cn(tokens.layout['main width'], 'py-6')}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

/* function Overview() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-md leading-6 font-medium text-gray-900">
          App Overview
        </h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Git remote</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-3">
              git@beta.aptible.com:aptible-misc/aptible-design-storybook.git
            </dd>
          </div>

          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Git Ref</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-3">
              a97c0323875add6773e6500cc6c23dbc2818a994
            </dd>
          </div>

          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Docker Image</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-3">
              Dockerfile build
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
} */

// const stats = [
//   { name: 'Total Subscribers', stat: '71,897', previousStat: '70,946', change: '12%', changeType: 'increase' },
//   { name: 'Avg. Open Rate', stat: '58.16%', previousStat: '56.14%', change: '2.02%', changeType: 'increase' },
//   { name: 'Avg. Click Rate', stat: '24.57%', previousStat: '28.62%', change: '4.05%', changeType: 'decrease' },
// ]

// export function Stats() {
//   return (
//     <div>
//       <dl className="grid grid-cols-1 rounded-lg bg-white overflow-hidden shadow divide-y divide-gray-200 md:grid-cols-3 md:divide-y-0 md:divide-x">
//         {stats.map((item) => (
//           <div key={item.name} className="px-4 py-5 sm:p-6">
//             <dt className="text-base font-normal text-gray-900">{item.name}</dt>
//             <dd className="mt-1 flex justify-between items-baseline md:block lg:flex">
//               <div className="flex items-baseline text-2xl font-semibold text-emerald-600">
//                 {item.stat}
//                 <span className="ml-2 text-sm font-medium text-gray-500">from {item.previousStat}</span>
//               </div>

//               <div
//                 className={cn(
//                   item.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
//                   'inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0'
//                 )}
//               >
//                 {item.changeType === 'increase' ? (
//                   <ArrowSmUpIcon
//                     className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500"
//                     aria-hidden="true"
//                   />
//                 ) : (
//                   <ArrowSmDownIcon
//                     className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-red-500"
//                     aria-hidden="true"
//                   />
//                 )}

//                 <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
//                 {item.change}
//               </div>
//             </dd>
//           </div>
//         ))}
//       </dl>
//     </div>
//   )
// }

const stats = [
  {
    id: 1,
    name: 'All Controls',
    stat: '100%',
    icon: ShieldCheckIcon,
    change: '122',
    changeType: 'increase',
  },
  {
    id: 2,
    name: 'HIPAA Controls',
    stat: '58.16%',
    icon: ShieldCheckIcon,
    change: '5.4%',
    changeType: 'increase',
  },
  {
    id: 3,
    name: 'HITRUST Controls',
    stat: '24.57%',
    icon: ShieldCheckIcon,
    change: '3.2%',
    changeType: 'decrease',
  },
  {
    id: 3,
    name: 'HITRUST Controls',
    stat: '24.57%',
    icon: ShieldCheckIcon,
    change: '3.2%',
    changeType: 'decrease',
  },
];

export function Stats() {
  return (
    <div>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.id}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-emerald-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.stat}
              </p>
              <p
                className={cn(
                  item.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold',
                )}
              >
                {item.changeType === 'increase' ? (
                  <ArrowSmUpIcon
                    className="self-center flex-shrink-0 h-5 w-5 text-green-500"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowSmDownIcon
                    className="self-center flex-shrink-0 h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                )}

                <span className="sr-only">
                  {item.changeType === 'increase' ? 'Increased' : 'Decreased'}{' '}
                  by
                </span>
                {item.change}
              </p>
              <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a
                    href="/"
                    className="font-medium text-emerald-600 hover:text-emerald-500"
                  >
                    {' '}
                    View controls
                    <span className="sr-only"> {item.name} stats</span>
                  </a>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
