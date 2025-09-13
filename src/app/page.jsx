// app/page.js
// This is the server-side main page

import ClientApp from './components/ClientApp';

async function fetchInitialMeetings() {
  try {
    const res = await fetch(`http://localhost:8000/meetings/demo`);
    const data = await res.json();
    return data.meetings || [];
  } catch (error) {
    console.error("Error fetching initial meetings:", error);
    return [];
  }
}

export default async function Page() {
  const initialMeetings = await fetchInitialMeetings();
  return <ClientApp initialMeetings={initialMeetings} />;
}