export interface Template {
  id: number;
  fileName: string;
  url: string;
}

export const templates: Template[] = [
  {
    id: 1,
    fileName: "Demo Document.docx",
    url: "https://calibre-ebook.com/downloads/demos/demo.docx",
  },
  {
    id: 2,
    fileName: "Test Word Document.doc",
    url: "https://homepages.inf.ed.ac.uk/neilb/TestWordDoc.doc",
  },
  {
    id: 3,
    fileName: "Sample Template.docx",
    url: "https://calibre-ebook.com/downloads/demos/demo.docx",
  },
  {
    id: 4,
    fileName: "Business Proposal.doc",
    url: "https://homepages.inf.ed.ac.uk/neilb/TestWordDoc.doc",
  },
];
