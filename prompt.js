
const prompt = `I would like you to extract information from text that I will provide to you. The extracted information should be outputted in parseable JSON format.
  The outputted JSON object should look like the following:
    
  {
    Name : "CanExport SME", Amount : 15000, Deadline : "2024-10-03", Summary : "The CanExport SMEs funding program provides Canadian government grants to support Canadian businesses seeking to develop new export opportunities and markets, particularly high-growth priority markets and sectors, by covering a portion of eligible sales and marketing activities.", Description : "Supports global expansion projects including participation in trade shows and government-led trade missions
    Up to 50% to a max $50,000 in grants", Eligible_Applicants : "Incorporated Canadian for-profit businesses <500 full-time payroll employees and between $100,000-$100M in Canadian annual revenue.", Eligible_Activities : "Virtual trade events, website SEO, adaptation of marketing tools, IP/product certification, and market research.", Eligible_Criteria : "Follow these steps to apply for CanExport Innovation:
    1. Familiarize yourself with the program details by reading our Applicant’s Guide.
    2. Create an account on our online portal.
    3. Note: Not compatible with Internet Explorer.
    4. Once you are signed in, enter your information under My Profile and select Update.
    5. On the CanExport Innovation landing page, select Apply Now!", 
    Eligible_Employees : 2, Eligible_Profitable : "Yes", Eligible_Region : "Ontario", Eligible_Industries : "technology"
  }

    where Name denotes the name of the grant, Amount denotes the maximum amount of funding receivable and should be a numerical field, Deadline denotes when grant
    applications are due, Summary denotes a summary of the grant, Description denotes a description of the grant, Eligible_Applicants
    denotes information about who is eligible to apply for the grant, Eligible_Activities denotes information about which expenses
    or activities make a company eligible to apply for the grant, Eligible_Criteria denotes information about the criteria that
    a company must meet in order to be eligible for the grant, Eligible_Employees denotes the minimum number of employees the 
    company must have in order to be eligible for the grant, Eligible_Profitable is a "Yes" if the grant requires that applicants are profitable and "No" otherwise,
    Eligible_Region denotes the province in Canada where the grant is applicable, and Eligible_Industries denotes which industries out of the 
    following list are applicable for this grant: [agriculture,technology,healthcare,manufacturing,energy,finance,education,retail,travel,automotive,entertainment,corporate services,media,transportation,environment,all].
    I have given examples of each field in the above JSON object. If you are unable to find the information for any of the fields, kindly write 'Coming Soon.' for that field.
    

    I will now provide the text in the next prompt, does this sound okay? Please only provide a JSON response. Provide no response otherwise.
  `;

const model = "gpt-3.5-turbo-1106";

const user_prompt = `I want you to extract the following information from text that I will provide to you:

Name: Extract the Name of the grant or loan in 7 words or less.
Amount: A numerical field representing the maximum amount of funding receivable from the grant or loan. Write 'Coming Soon' if you are unsure.
Deadline: A string field representing when the deadline to apply for the grant or loan is. An example of the Deadline field is this: "2024-10-23". Format as "YEAR-MO-DA". By default, write '2024-03-31'.
Eligible_Region: Write the region in which the grant or loan is applicable. Write "Canada" by default. Write "Canada" if the grant or loan is applicable everywhere in Canada.
Eligible_Profitable: Write "Yes" if the grant or loan requires the applicant's company is profitable. Write "No" otherwise. Write 'No' if you are unsure.
Eligible_Revenue: This is a numerical field that represents how much revenue the applicant's company must have in order to be eligible for for the grant or loan. By default, write 100000
Eligible_Employees: This is a numerical field representing how many employees the applicant's company needs in order to be eligible for the grant or loan. By default, write 2.
Eligible_Activities: Describes the activities or expenses that make a company eligible for this grant or loan. An example of this is: "Virtual trade events, website SEO, adaptation of marketing tools, IP/product certification, and market research."
Eligible_Applicants: Describes the applicants that are eligible for this grant or loan. An example of this is: "Incorporated Canadian for-profit businesses <500 full-time payroll employees and between $100,000-$100M in Canadian annual revenue."
Eligible_Criteria: Describes the criteria that a company must meet in order to be eligible for the grant or loan. An example of this is: "Follow these steps to apply for CanExport Innovation: 1. Familiarize yourself with the program details by reading our Applicant’s Guide. 2. Create an account on our online portal. 3. Note: Not compatible with Internet Explorer. 4. Once you are signed in, enter your information under My Profile and select Update. 5. On the CanExport Innovation landing page, select Apply Now!" If you are unsure, write 'Coming Soon'
Description: A description of the grant or loan. An example of this is: "The grant aims to help SMEs reduce overhead costs, accelerate transactions, improve client responsiveness, manage inventory, and enhance supply chain logistics. It also offers the opportunity to apply for a BDC 0% interest loan and subsidized employee, with a completed digital adoption plan."
Summary: A summary of the grant or loan. An example of this is: "The CDAP Boost Your Business Technology grant provides up to $15,000 to help Canadian SMEs increase productivity, consolidate back office software, and enhance cybersecurity tools. It is designed to support digital transformation tailored to each business."
Grant_Goals: Describes the goal or purpose of this grant. An example of this is: "To increase the number of research positions in Southern Ontario"
Eligible_Industries: A list of the industies that are applicable to this grant or loan. Write "all" if you can not find this information. Write "all" if the grant is applicable to all industries.


Follow this Pydantic specification for how to output the JSON:

class Funding(BaseModel):
  Name: str
  Amount: conint(ge=0)
  Deadline: str
  Eligible_Region: Literal["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Canada"]
  Eligible_Profitable: Literal["Yes", "No"]
  Eligible_Revenue: conint(ge=0)
  Eligible_Employees: conint(ge=2)
  Eligible_Activities: str
  Eligible_Applicants: str
  Eligible_Criteria: str
  Description: str
  Summary: str
  Grant_Goals: str
  Eligible_Industries: List[Literal["agriculture","technology","healthcare","manufacturing","energy","finance","education","retail","travel","automotive","entertainment","corporate services","media","transportation","environment","all"]]


  
I will now give you the text to extract this information from. Does this sound okay?
`;

let messages = [
  { role : "system", content : "You will output only valid and parseable JSON."},
  { role: "user", content: user_prompt },
  {
    role: "assistant",
    content: "Yes, that sounds okay. Please provide the text from which you would like information to be extracted.",
  },
];

export {model, messages};
