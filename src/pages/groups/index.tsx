import dynamic from 'next/dynamic';

const GroupsPage = () => {
  // Your original component code here
  // ...
};

export default dynamic(() => Promise.resolve(GroupsPage), { ssr: false }); 