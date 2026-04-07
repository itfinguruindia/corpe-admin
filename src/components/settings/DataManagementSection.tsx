export default function DataManagementSection() {
  return (
    <div className="rounded-xl bg-white shadow-sm p-6">
      <h3 className="text-lg font-semibold text-secondary mb-4">
        Data Management
      </h3>

      <ul className="space-y-3">
        <li className="text-base text-gray-700 hover:text-secondary cursor-pointer transition-colors">
          Backup schedule
        </li>
        <li className="text-base text-gray-700 hover:text-secondary cursor-pointer transition-colors">
          Encryption & storage details
        </li>
      </ul>
    </div>
  );
}
