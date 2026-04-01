import AddOfficer from "../components/AddOfficer";
import ComplaintList from "../components/ComplaintList";

export default function OfficerPage({ level, user }) {
  return (
    <>
      <AddOfficer role="officer" level={level} />
      <ComplaintList isOfficer={true} user={user} />
    </>
  );
}