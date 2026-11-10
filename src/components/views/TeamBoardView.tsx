import React from 'react';
import {
  Award,
  BookOpen,
  Mail,
  GraduationCap,
  Building,
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  subRole: string;
  affiliation: string;
  department: string;
  contributions: string[];
  imageUrl: string;
  email?: string;
  isFaculty?: boolean;
}

export const TeamBoardView: React.FC = () => {
  const studentTeam: TeamMember[] = [
    {
      name: 'G. Sai Abiram',
      role: 'Lead Architect & ViT Taxonomy Lead',
      subRole: 'Major Project Phase-I Lead Researcher',
      department: 'Dept. of CSE (Data Science)',
      affiliation: 'CMR College of Engineering & Technology, Hyderabad',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQHOIiqBzvu_2g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1724344651249?e=1794441600&v=beta&t=s02zcXgEfPsXWk-YbC9rEBiczUpVOyXZh8obMEof7zo',
      contributions: [
        'End-to-end framework architecture and stateful digital twin lifecycle design.',
        'Vision Transformer (ViT-B/16) hierarchical taxonomic classification pipeline.',
        'Continuous synchronization between edge telemetry and evolving plant twin profiles.',
      ],
    },
    {
      name: 'P. Rakshith Reddy',
      role: 'Computer Vision & SAM Pathology Lead',
      subRole: 'Major Project Phase-I Lead Researcher',
      department: 'Dept. of CSE (Data Science)',
      affiliation: 'CMR College of Engineering & Technology, Hyderabad',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D5603AQEEUdIqgcB0Zg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726814862325?e=1794441600&v=beta&t=ym8lQC7PL4l0fCFiaKBDjG7UGswClU7OST6l8hU0vTA',
      contributions: [
        'Segment Anything Model (SAM) zero-shot leaf contour isolation in unconstrained field images.',
        'Explainable AI (XAI) Grad-CAM attention heatmap generation for disease lesions.',
        'Longitudinal before-and-after tissue recovery quantification models.',
      ],
    },
    {
      name: 'K. Madhulika Reddy',
      role: 'RAG Remediation & Digital Twin State Lead',
      subRole: 'Major Project Phase-I Lead Researcher',
      department: 'Dept. of CSE (Data Science)',
      affiliation: 'CMR College of Engineering & Technology, Hyderabad',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      contributions: [
        'Retrieval-Augmented Generation (RAG) botanical knowledge synthesis and clinical prescription engine.',
        'Room Database persistence architecture and multi-entity DAO relations.',
        'Dynamic microclimate synchronization and weather-based watering postponement rules.',
      ],
    },
  ];

  const facultyMentors: TeamMember[] = [
    {
      name: 'Dr. Venkateswara Reddy',
      role: 'Project Supervisor & Corresponding Guide',
      subRole: 'Associate Professor & Senior Researcher',
      department: 'Dept. of CSE (Data Science)',
      affiliation: 'CMR College of Engineering & Technology, Hyderabad',
      email: 'venkatreddyvari@cmrcet.ac.in',
      isFaculty: true,
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
      contributions: [
        'Academic research direction, stateful digital twin methodology validation.',
        'Computer vision feature-fusion benchmarking against PlantDoc and IEEE Access standards.',
        'Technical manuscript review and corresponding authorship.',
      ],
    },
    {
      name: 'Dr. B. Raja Rao ',
      role: 'Research Co-Supervisor & Corresponding Mentor',
      subRole: 'Assistant Professor & Botanical ML Advisor',
      department: 'Dept. of CSE (Data Science)',
      affiliation: 'CMR College of Engineering & Technology, Hyderabad',
      email: 'B.RajaRao@gmail.com',
      isFaculty: true,
      imageUrl: 'https://media.licdn.com/dms/image/v2/C5603AQGl8SZB0GwDig/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1626023006147?e=1794441600&v=beta&t=KE8RR3YBOjKwZE1HtSZuiOKESE9Qz59nZZEhbZwak7M',
      contributions: [
        'Domain consultation on plant-leaf pathology and ASPCA botanical taxonomy.',
        'RAG grounding verification and ethical AI explainability evaluation.',
        'Experimental validation and dataset curation governance.',
      ],
    },
  ];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in max-w-6xl mx-auto">
      {/* Editorial Academic Header */}
      <div className="luxury-card p-8 sm:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34c759]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2c6b4f]">
              Department of CSE (Data Science) • Major Project Phase-I
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172a21] tracking-tight leading-tight">
            Research Authors & Project Board
          </h1>

          <p className="text-sm sm:text-base text-[#4a5d52] leading-relaxed">
            PhytoSophia was conceptualized and developed under the academic auspices of CMR College of Engineering & Technology (Academic Year 2026–2027), establishing an original stateful digital-twin framework that unifies Vision Transformer taxonomy, SAM-based explainable pathology, and RAG remediation.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-medium text-[#83978b] border-t border-[#e8f0e9]">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#2c6b4f]" />
              <span>CMRCET, Hyderabad, India</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#2c6b4f]" />
              <span>B.Tech in Computer Science & Engineering (Data Science)</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2c6b4f]" />
              <span>Academic Year 2026–2027</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Research Authors Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e8f0e9] pb-3">
          <div>
            <h2 className="text-xl font-bold text-[#172a21] tracking-tight">
              Primary Research Authors
            </h2>
            <p className="text-xs text-[#83978b] mt-0.5">
              Undergraduate researchers responsible for core algorithm development and implementation.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#2c6b4f] bg-[#e8f0e9] border border-[#c5ddc7] px-3 py-1 rounded-full">
            3 Authors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {studentTeam.map((author, idx) => (
            <div
              key={idx}
              className="luxury-card overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Author Portrait */}
                <div className="relative h-64 w-full bg-[#f2f7f3] overflow-hidden">
                  <img
                    src={author.imageUrl}
                    alt={author.name}
                    className="w-full h-full object-cover object-center filter saturate-[0.95]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172a21]/80 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                      {author.department}
                    </span>
                    <h3 className="text-lg font-bold">
                      {author.name}
                    </h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-[#2c6b4f] bg-[#e8f0e9] px-2.5 py-1 rounded-full block w-fit mb-1 border border-[#c5ddc7]">
                      {author.role}
                    </span>
                    <p className="text-xs text-[#4a5d52] font-medium">{author.subRole}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#e8f0e9]">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#83978b] block">
                      Key Research Contributions
                    </span>
                    <ul className="space-y-2">
                      {author.contributions.map((c, i) => (
                        <li key={i} className="text-xs text-[#4a5d52] flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] shrink-0 mt-1.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="w-full py-2 bg-[#f7faf8] text-[#4a5d52] rounded-full text-center text-xs font-semibold border border-[#e8f0e9]">
                  CMRCET CSE (Data Science)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculty Mentors & Guides Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e8f0e9] pb-3">
          <div>
            <h2 className="text-xl font-bold text-[#172a21] tracking-tight">
              Faculty Supervisors & Corresponding Mentors
            </h2>
            <p className="text-xs text-[#83978b] mt-0.5">
              Senior academic faculty guiding project direction, methodology, and peer review.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#2c6b4f] bg-[#e8f0e9] border border-[#c5ddc7] px-3.5 py-1 rounded-full">
            Corresponding Authors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facultyMentors.map((mentor, idx) => (
            <div
              key={idx}
              className="luxury-card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-[#e8f0e9] shadow-xs">
                <img
                  src={mentor.imageUrl}
                  alt={mentor.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="space-y-3 flex-1 min-w-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2c6b4f] bg-[#e8f0e9] border border-[#c5ddc7] px-2.5 py-0.5 rounded-full">
                      Faculty Guide
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#172a21] mt-1">
                    {mentor.name}
                  </h3>
                  <p className="text-xs text-[#4a5d52] font-medium">{mentor.role}</p>
                </div>

                <div className="space-y-1 text-xs text-[#4a5d52]">
                  <div className="flex items-center gap-2 text-[#83978b]">
                    <Building className="w-3.5 h-3.5 text-[#2c6b4f]" />
                    <span>{mentor.department}, CMRCET</span>
                  </div>
                  {mentor.email && (
                    <div className="flex items-center gap-2 text-[#2c6b4f] font-medium">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${mentor.email}`} className="hover:underline">
                        {mentor.email}
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pt-3 border-t border-[#e8f0e9]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#83978b] block">
                    Supervisory Scope
                  </span>
                  <ul className="space-y-1 text-xs text-[#4a5d52]">
                    {mentor.contributions.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#34c759] font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Research Citation Callout */}
      <div className="luxury-card p-6 sm:p-8 bg-gradient-to-r from-[#e8f0e9]/60 to-[#f2f7f3]/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#2c6b4f] font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#34c759]" />
            Official Paper Reference
          </div>
          <h4 className="text-base font-bold text-[#172a21]">
            PhytoSophia: A Stateful Digital Twin for Plant Management Integrating ViT Taxonomy, SAM-Based Explainable Pathology, and RAG-Driven Remediation
          </h4>
          <p className="text-xs text-[#4a5d52]">
            G. Sai Abiram, P. Rakshith Reddy, K. Madhulika Reddy • Supervised by Dr. Venkateswara Reddy & Dr. B. Raja Rao .
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs font-semibold px-4 py-2 bg-white text-[#2c6b4f] border border-[#e8f0e9] rounded-full shadow-xs">
            Major Project Phase-I
          </span>
        </div>
      </div>
    </div>
  );
};
