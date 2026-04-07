import React from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { mockClientMessages } from "@/lib/data/mockCommunicationData";

export default function ClientMessagesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#FF6A3D]">GUJC000001</h1>
          <div className="mt-4 inline-block">
            <span className="rounded-full bg-[#FFE5DD] px-6 py-2 text-lg font-medium text-secondary">
              Communication
            </span>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div>
        <h2 className="text-2xl font-semibold text-secondary">
          Client Message
        </h2>
      </div>

      {/* Messages Table */}
      <div className="rounded-xl bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Application Number
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Name of the Company
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-secondary">
                Client Name
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-secondary">
                View Message
              </th>
            </tr>
          </thead>
          <tbody>
            {mockClientMessages.map((message, index) => (
              <tr
                key={message.id}
                className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                  index === 0 ? "bg-white" : ""
                }`}
              >
                <td className="px-6 py-4 text-lg font-medium text-[#FF6A3D]">
                  {message.applicationNo}
                </td>
                <td className="px-6 py-4 text-base text-gray-700">
                  {message.companyName}
                </td>
                <td className="px-6 py-4 text-base text-gray-700">
                  {message.clientName}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <Link
                      href={`/messages/${message.id}`}
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-[#FF6A3D] transition-all hover:bg-[#FFE5DD]"
                    >
                      <MessageSquare className="h-7 w-7" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State - Show when no messages */}
      {mockClientMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
          <MessageSquare className="h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">No messages yet</p>
        </div>
      )}
    </div>
  );
}
