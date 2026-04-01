import ComplaintForm from "../components/ComplaintForm";
import ComplaintList from "../components/ComplaintList";

export default function CitizenPage() {
  return (
    <>
      <ComplaintForm />
      <ComplaintList isOfficer={false} />
    </>
  );
}