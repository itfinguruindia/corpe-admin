// Mock data for Directors
// TODO: Replace with actual API calls when backend is ready

import { Director } from "@/types/director";

// Mock directors data
export const mockDirectorsData: Record<string, Director[]> = {
  GUJC000001: [
    {
      id: "dir-1",
      applicationNo: "GUJC000001",
      directorNumber: 1,
      hasDIN: false,
      directorName: "Rajesh Kumar",
      fatherName: "Suresh Kumar",
      email: "rajesh@example.com",
      phoneNo: "+91 9876543210",
      gender: "Male",
      dateOfBirth: "1985-05-15",
      nationality: "Indian",
      passportNo: "K1234567",
      occupationType: "Business",
      placeOfBirth: "Ahmedabad",
      educationQualification: "MBA",
      presentAddress: "123, MG Road, Ahmedabad, Gujarat - 380001",
      permanentAddress: "456, SG Highway, Ahmedabad, Gujarat - 380015",
      pan: "ABCDE1234F",
      durationOfStayAtPresentAddress: "5 years",
      previousResidenceAddress: "789, CG Road, Ahmedabad, Gujarat - 380006",
      shareholdingPercentage: 60,
      kycVerified: true,
      dscApplication: true,
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-02-07T00:00:00Z",
      directorId: "",
      name: "",
    },
    {
      id: "dir-2",
      applicationNo: "GUJC000001",
      directorNumber: 2,
      hasDIN: true,
      din: "12345678",
      directorName: "Priya Sharma",
      fatherName: "Anil Sharma",
      email: "priya@example.com",
      phoneNo: "+91 9876543211",
      gender: "Female",
      dateOfBirth: "1990-08-20",
      nationality: "Indian",
      occupationType: "Professional",
      placeOfBirth: "Surat",
      educationQualification: "B.Tech",
      presentAddress: "321, Ring Road, Ahmedabad, Gujarat - 380009",
      permanentAddress: "654, Ashram Road, Ahmedabad, Gujarat - 380014",
      pan: "FGHIJ5678K",
      durationOfStayAtPresentAddress: "3 years",
      shareholdingPercentage: 40,
      kycVerified: false,
      dscApplication: false,
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-02-07T00:00:00Z",
      directorId: "",
      name: "",
    },
  ],
  GUJC00001: [
    {
      id: "dir-3",
      applicationNo: "GUJC00001",
      directorNumber: 1,
      hasDIN: false,
      directorName: "Amit Patel",
      fatherName: "Dinesh Patel",
      email: "amit@example.com",
      phoneNo: "+91 9876543212",
      gender: "Male",
      dateOfBirth: "1988-03-10",
      nationality: "Indian",
      passportNo: "M9876543",
      occupationType: "Business",
      placeOfBirth: "Ahmedabad",
      educationQualification: "CA",
      presentAddress: "555, Satellite Road, Ahmedabad, Gujarat - 380015",
      permanentAddress: "666, Vastrapur, Ahmedabad, Gujarat - 380015",
      pan: "LMNOP9012Q",
      durationOfStayAtPresentAddress: "7 years",
      shareholdingPercentage: 60,
      kycVerified: true,
      dscApplication: true,
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-02-07T00:00:00Z",
      directorId: "",
      name: "",
    },
    {
      id: "dir-3b",
      applicationNo: "GUJC00001",
      directorNumber: 2,
      hasDIN: true,
      din: "98765432",
      directorName: "Neha Shah",
      fatherName: "Rakesh Shah",
      email: "neha@example.com",
      phoneNo: "+91 9876543215",
      gender: "Female",
      dateOfBirth: "1992-06-18",
      nationality: "Indian",
      occupationType: "Professional",
      placeOfBirth: "Ahmedabad",
      educationQualification: "MBA",
      presentAddress: "777, Prahlad Nagar, Ahmedabad, Gujarat - 380015",
      permanentAddress: "888, Bodakdev, Ahmedabad, Gujarat - 380054",
      pan: "QRSTU6789V",
      durationOfStayAtPresentAddress: "4 years",
      shareholdingPercentage: 40,
      kycVerified: true,
      dscApplication: false,
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-02-07T00:00:00Z",
      directorId: "",
      name: "",
    },
  ],
  RAJC00002: [
    {
      id: "dir-4",
      applicationNo: "RAJC00002",
      directorNumber: 1,
      hasDIN: true,
      din: "87654321",
      directorName: "Vikram Singh",
      fatherName: "Mahendra Singh",
      email: "vikram@example.com",
      phoneNo: "+91 9876543213",
      gender: "Male",
      dateOfBirth: "1982-11-25",
      nationality: "Indian",
      occupationType: "Business",
      placeOfBirth: "Jaipur",
      educationQualification: "B.Com",
      presentAddress: "101, MI Road, Jaipur, Rajasthan - 302001",
      permanentAddress: "202, Mansarovar, Jaipur, Rajasthan - 302020",
      pan: "RSTUV3456W",
      durationOfStayAtPresentAddress: "10 years",
      shareholdingPercentage: 75,
      kycVerified: true,
      dscApplication: true,
      createdAt: "2025-01-10T00:00:00Z",
      updatedAt: "2025-02-05T00:00:00Z",
      directorId: "",
      name: "",
    },
    {
      id: "dir-5",
      applicationNo: "RAJC00002",
      directorNumber: 2,
      hasDIN: false,
      directorName: "Anita Verma",
      fatherName: "Rajesh Verma",
      email: "anita@example.com",
      phoneNo: "+91 9876543214",
      gender: "Female",
      dateOfBirth: "1987-04-12",
      nationality: "Indian",
      passportNo: "P8765432",
      occupationType: "Business",
      placeOfBirth: "Jaipur",
      educationQualification: "M.Com",
      presentAddress: "303, Vaishali Nagar, Jaipur, Rajasthan - 302021",
      permanentAddress: "404, Malviya Nagar, Jaipur, Rajasthan - 302017",
      pan: "WXYZZ7890A",
      durationOfStayAtPresentAddress: "6 years",
      shareholdingPercentage: 25,
      kycVerified: false,
      dscApplication: true,
      createdAt: "2025-01-10T00:00:00Z",
      updatedAt: "2025-02-05T00:00:00Z",
      directorId: "",
      name: "",
    },
  ],
  BHIC00001: [
    {
      id: "dir-6",
      applicationNo: "BHIC00001",
      directorNumber: 1,
      hasDIN: false,
      directorName: "Sanjay Mehta",
      fatherName: "Ramesh Mehta",
      email: "sanjay@example.com",
      phoneNo: "+91 9876543220",
      gender: "Male",
      dateOfBirth: "1990-07-22",
      nationality: "Indian",
      occupationType: "Business",
      placeOfBirth: "Mumbai",
      educationQualification: "B.Tech",
      presentAddress: "505, Andheri West, Mumbai, Maharashtra - 400058",
      permanentAddress: "606, Borivali East, Mumbai, Maharashtra - 400066",
      pan: "BBCCD8901E",
      durationOfStayAtPresentAddress: "2 years",
      shareholdingPercentage: 100,
      kycVerified: false,
      dscApplication: false,
      createdAt: "2025-02-01T00:00:00Z",
      updatedAt: "2025-02-07T00:00:00Z",
      directorId: "",
      name: "",
    },
  ],
  DLEC00001: [
    {
      id: "dir-7",
      applicationNo: "DLEC00001",
      directorNumber: 1,
      hasDIN: true,
      din: "11223344",
      directorName: "Rahul Gupta",
      fatherName: "Sunil Gupta",
      email: "rahul@example.com",
      phoneNo: "+91 9876543221",
      gender: "Male",
      dateOfBirth: "1986-09-30",
      nationality: "Indian",
      occupationType: "Professional",
      placeOfBirth: "Delhi",
      educationQualification: "MBA",
      presentAddress: "707, Connaught Place, Delhi - 110001",
      permanentAddress: "808, Rohini, Delhi - 110085",
      pan: "EEFFG9012H",
      durationOfStayAtPresentAddress: "8 years",
      shareholdingPercentage: 55,
      kycVerified: true,
      dscApplication: true,
      createdAt: "2025-01-05T00:00:00Z",
      updatedAt: "2025-02-06T00:00:00Z",
      directorId: "",
      name: "",
    },
    {
      id: "dir-8",
      applicationNo: "DLEC00001",
      directorNumber: 2,
      hasDIN: false,
      directorName: "Kavita Kapoor",
      fatherName: "Ashok Kapoor",
      email: "kavita@example.com",
      phoneNo: "+91 9876543222",
      gender: "Female",
      dateOfBirth: "1991-02-14",
      nationality: "Indian",
      occupationType: "Professional",
      placeOfBirth: "Delhi",
      educationQualification: "CA",
      presentAddress: "909, Dwarka, Delhi - 110075",
      permanentAddress: "1010, Pitampura, Delhi - 110034",
      pan: "HIJKL0123M",
      durationOfStayAtPresentAddress: "5 years",
      shareholdingPercentage: 45,
      kycVerified: true,
      dscApplication: false,
      createdAt: "2025-01-05T00:00:00Z",
      updatedAt: "2025-02-06T00:00:00Z",
      directorId: "",
      name: "",
    },
  ],
};

// Simulated API functions for future integration

/**
 * Fetches all directors for a specific application
 * @param applicationNo - The application number
 * @returns Promise<Director[]>
 */
export async function fetchDirectors(
  applicationNo: string,
): Promise<Director[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/applications/${applicationNo}/directors`);
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const directors = mockDirectorsData[applicationNo];
  if (!directors) {
    return [];
  }

  return directors;
}

/**
 * Fetches a specific director by ID
 * @param applicationNo - The application number
 * @param directorId - The director ID
 * @returns Promise<Director>
 */
export async function fetchDirectorById(
  applicationNo: string,
  directorId: string,
): Promise<Director> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/applications/${applicationNo}/directors/${directorId}`);
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const directors = mockDirectorsData[applicationNo];
  if (!directors) {
    throw new Error(`No directors found for application ${applicationNo}`);
  }

  const director = directors.find((d) => d.id === directorId);
  if (!director) {
    throw new Error(`Director with ID ${directorId} not found`);
  }

  return director;
}

/**
 * Updates director information
 * @param applicationNo - The application number
 * @param directorId - The director ID
 * @param updates - Partial director data to update
 * @returns Promise<Director>
 */
export async function updateDirector(
  applicationNo: string,
  directorId: string,
  updates: Partial<Director>,
): Promise<Director> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/applications/${applicationNo}/directors/${directorId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updates),
  // });
  // const data = await response.json();
  // return data;

  // Simulated API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const directors = mockDirectorsData[applicationNo];
  if (!directors) {
    throw new Error(`No directors found for application ${applicationNo}`);
  }

  const directorIndex = directors.findIndex((d) => d.id === directorId);
  if (directorIndex === -1) {
    throw new Error(`Director with ID ${directorId} not found`);
  }

  // Update mock data
  const updatedDirector = {
    ...directors[directorIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  mockDirectorsData[applicationNo][directorIndex] = updatedDirector;

  return updatedDirector;
}
