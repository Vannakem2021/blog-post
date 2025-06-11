import { BlogPost, Profile, BreakingNews } from "./types";

export const mockProfile: Profile = {
  id: "1",
  email: "admin@example.com",
  fullName: "Sarah Johnson",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  role: "admin",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  bio: "Senior News Editor with 10+ years of experience in digital journalism",
  title: "Senior News Editor",
  socialLinks: {
    twitter: "@sarahjohnson",
    linkedin: "sarah-johnson-news",
  },
};

export const mockAuthors: Profile[] = [
  mockProfile,
  {
    id: "2",
    email: "mike.chen@example.com",
    fullName: "Mike Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    bio: "Technology correspondent covering AI, startups, and digital innovation",
    title: "Technology Correspondent",
    socialLinks: {
      twitter: "@mikechen_tech",
      linkedin: "mike-chen-tech",
    },
  },
  {
    id: "3",
    email: "alex.rivera@example.com",
    fullName: "Alex Rivera",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    bio: "Political reporter covering national politics and policy analysis",
    title: "Political Reporter",
    socialLinks: {
      twitter: "@alexrivera_pol",
      linkedin: "alex-rivera-politics",
    },
  },
];

export const mockBreakingNews: BreakingNews[] = [
  {
    id: "breaking-1",
    title: "Major Technology Breakthrough Announced by Leading AI Company",
    summary:
      "Revolutionary advancement in artificial intelligence promises to transform multiple industries",
    url: "/technology/ai-breakthrough-announcement",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isActive: true,
    priority: 1,
  },
  {
    id: "breaking-2",
    title: "Global Climate Summit Reaches Historic Agreement",
    summary:
      "World leaders commit to ambitious new targets for carbon reduction",
    url: "/world/climate-summit-agreement",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isActive: true,
    priority: 2,
  },
];

export const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "Major Technology Breakthrough Announced by Leading AI Company",
    slug: "ai-breakthrough-announcement",
    content: `
      <h2>Revolutionary AI Development</h2>
      <p>A leading artificial intelligence company announced today a groundbreaking advancement that promises to transform multiple industries. The new technology represents a significant leap forward in machine learning capabilities.</p>

      <h3>Key Features of the Breakthrough</h3>
      <p>The announcement details several key improvements including enhanced processing speed, improved accuracy, and reduced computational requirements. Industry experts are calling it a game-changer for the AI sector.</p>

      <h3>Industry Impact</h3>
      <p>The technology is expected to have immediate applications in healthcare, finance, and autonomous systems. Early adopters are already expressing interest in implementation.</p>

      <h2>Market Response</h2>
      <p>Stock markets responded positively to the news, with technology sector shares seeing significant gains in after-hours trading...</p>
    `,
    excerpt:
      "Revolutionary advancement in artificial intelligence promises to transform multiple industries with enhanced processing capabilities and improved accuracy.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    featuredImageAlt: "AI technology visualization",
    status: "published",
    publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    authorId: "2",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    category: "technology",
    urgencyLevel: "breaking",
    readingTime: 4,
    sourceAttribution: ["TechCorp Press Release", "Industry Analysis"],
    isBreaking: true,
    isFeatured: true,
    viewCount: 15420,
    shareCount: 892,
  },
  {
    id: "2",
    title: "Global Climate Summit Reaches Historic Agreement",
    slug: "climate-summit-agreement",
    content: `
      <h2>Landmark Climate Deal</h2>
      <p>World leaders at the Global Climate Summit have reached a historic agreement on carbon reduction targets, marking a significant milestone in international climate action. The agreement includes binding commitments from major economies.</p>

      <h3>Key Provisions</h3>
      <ul>
        <li>50% reduction in global emissions by 2030</li>
        <li>$100 billion annual climate fund</li>
        <li>Transition to renewable energy</li>
        <li>Protection of biodiversity hotspots</li>
      </ul>

      <h2>Implementation Timeline</h2>
      <p>The agreement outlines a comprehensive timeline for implementation, with quarterly reviews and accountability measures...</p>
    `,
    excerpt:
      "World leaders commit to ambitious new targets for carbon reduction in a historic climate agreement that could reshape global environmental policy.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=400&fit=crop",
    featuredImageAlt: "Climate summit meeting with world leaders",
    status: "published",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    authorId: "3",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: "world",
    urgencyLevel: "breaking",
    readingTime: 6,
    sourceAttribution: ["UN Climate Summit", "Reuters"],
    isBreaking: true,
    isFeatured: true,
    viewCount: 23150,
    shareCount: 1456,
  },
  {
    id: "3",
    title: "Federal Reserve Announces Interest Rate Decision",
    slug: "federal-reserve-interest-rate-decision",
    content: `
      <h2>Monetary Policy Update</h2>
      <p>The Federal Reserve announced its latest interest rate decision today, maintaining the current rate while signaling potential changes in the coming quarters. The decision comes amid ongoing economic uncertainty and inflation concerns.</p>

      <h3>Economic Indicators</h3>
      <p>Recent economic data shows mixed signals, with employment remaining strong while inflation shows signs of cooling...</p>
    `,
    excerpt:
      "Federal Reserve maintains current interest rates while signaling potential policy changes amid economic uncertainty and inflation concerns.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
    featuredImageAlt: "Federal Reserve building",
    status: "published",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    authorId: "1",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: "business",
    urgencyLevel: "urgent",
    readingTime: 5,
    sourceAttribution: ["Federal Reserve", "Financial Times"],
    isBreaking: false,
    isFeatured: false,
    viewCount: 8750,
    shareCount: 234,
  },
  {
    id: "4",
    title: "Major Sports Championship Finals Draw Record Viewership",
    slug: "sports-championship-record-viewership",
    content: `
      <h2>Historic Viewership Numbers</h2>
      <p>The championship finals drew a record-breaking audience of over 50 million viewers, making it the most-watched sporting event of the year. The thrilling match kept fans on the edge of their seats until the final moments.</p>

      <h3>Game Highlights</h3>
      <p>The match featured incredible performances from both teams, with several record-breaking plays and a dramatic overtime finish...</p>
    `,
    excerpt:
      "Championship finals break viewership records with over 50 million viewers tuning in for the most-watched sporting event of the year.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
    featuredImageAlt: "Sports stadium with crowd",
    status: "published",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    authorId: "1",
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    category: "sports",
    urgencyLevel: "normal",
    readingTime: 3,
    sourceAttribution: ["ESPN", "Sports Network"],
    isBreaking: false,
    isFeatured: false,
    viewCount: 12340,
    shareCount: 567,
  },
  {
    id: "5",
    title: "New Healthcare Initiative Aims to Improve Rural Access",
    slug: "healthcare-rural-access-initiative",
    content: `
      <h2>Expanding Healthcare Access</h2>
      <p>A new federal initiative aims to improve healthcare access in rural communities through telemedicine programs and mobile clinics. The program addresses critical gaps in rural healthcare infrastructure.</p>

      <h3>Program Components</h3>
      <p>The initiative includes funding for telemedicine equipment, training for healthcare providers, and mobile clinic deployment...</p>
    `,
    excerpt:
      "Federal initiative launches to improve rural healthcare access through telemedicine programs and mobile clinics addressing infrastructure gaps.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
    featuredImageAlt: "Rural healthcare clinic",
    status: "published",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    authorId: "1",
    createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: "health",
    urgencyLevel: "normal",
    readingTime: 4,
    sourceAttribution: ["Department of Health", "Rural Health Association"],
    isBreaking: false,
    isFeatured: false,
    viewCount: 5670,
    shareCount: 123,
  },
];

// Helper functions for news data
export const mockPublishedPosts = mockPosts.filter(
  (post) => post.status === "published"
);
export const mockDraftPosts = mockPosts.filter(
  (post) => post.status === "draft"
);

export const mockBreakingPosts = mockPosts.filter(
  (post) => post.isBreaking === true
);

export const mockFeaturedPosts = mockPosts.filter(
  (post) => post.isFeatured === true
);

export const getPostsByCategory = (category: string) =>
  mockPosts.filter(
    (post) => post.category === category && post.status === "published"
  );

export const getTrendingPosts = () =>
  mockPosts
    .filter((post) => post.status === "published")
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

export const getAuthorById = (id: string) =>
  mockAuthors.find((author) => author.id === id);

// News categories for navigation
export const newsCategories = [
  { name: "Politics", slug: "politics", color: "bg-red-100 text-red-800" },
  { name: "Business", slug: "business", color: "bg-green-100 text-green-800" },
  {
    name: "Technology",
    slug: "technology",
    color: "bg-blue-100 text-blue-800",
  },
  { name: "Sports", slug: "sports", color: "bg-orange-100 text-orange-800" },
  { name: "World", slug: "world", color: "bg-purple-100 text-purple-800" },
  { name: "Health", slug: "health", color: "bg-pink-100 text-pink-800" },
  { name: "Local", slug: "local", color: "bg-yellow-100 text-yellow-800" },
  { name: "Opinion", slug: "opinion", color: "bg-gray-100 text-gray-800" },
  {
    name: "Entertainment",
    slug: "entertainment",
    color: "bg-indigo-100 text-indigo-800",
  },
];
