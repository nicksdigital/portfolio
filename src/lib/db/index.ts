import { articles, tags, articleTags, claps, annotations } from './schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Using mock database implementation');

// Mock data with content from our portfolio site
const mockArticles = [
  {
    id: 1,
    slug: 'axiomverse-layerblog',
    locale: 'en',
    title: 'AxiomVerse & LayerBlog: Redefining Digital Experiences',
    description: 'Revolutionary approaches to content and decentralized networks using quantum-inspired technologies',
    layers: {
      headline: { content: '<h1>AxiomVerse & LayerBlog: Next-Gen Digital Experiences</h1>' },
      context: { content: '<p>Digital experiences are evolving beyond traditional paradigms, requiring new frameworks for data management, security, and content presentation. This document outlines two interconnected innovations: AxiomVerse, a quantum-inspired decentralized network, and LayerBlog, a revolutionary content platform that gives users control over information depth and engagement.</p>' },
      detail: { content: '<h2>AxiomVerse: Beyond Traditional Blockchain</h2><p>Unlike traditional blockchain\'s linear blocks, AxiomVerse utilizes axioms—complex, multi-dimensional data structures designed to manage intricate transactions and metadata with greater precision.</p><h3>Multi-Layer Composition</h3><ul><li>Each axiom contains multiple layers of data with different access permissions and encryption levels</li><li>Enhanced capacity for storing and processing complex metadata associated with transactions</li><li>Native representation of complex assets</li></ul><h2>LayerBlog: Content with Depth</h2><p>LayerBlog organizes content into distinct layers that users can navigate based on their interest and available time.</p><h3>Multi-Layered Content Architecture</h3><ul><li>Headline Layer: Key points and main takeaways - perfect for quick scanning</li><li>Context Layer: Background information and explanatory content</li><li>Detail Layer: In-depth analysis and technical details</li><li>Discussion Layer: Community insights and author responses</li></ul>' },
      discussion: { content: '<p>What other innovations do you see coming in the digital content space? How might quantum-inspired designs impact user experiences?</p>' }
    },
    date: new Date('2025-04-15'),
    image: '/images/axiomverse-banner.jpg',
    published: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    slug: 'layerblog-platform',
    locale: 'en',
    title: 'LayerBlog: Next-Generation Blogging Platform',
    description: 'A multi-layered approach to content with integrated, contextual reader engagement',
    layers: {
      headline: { content: '<h1>LayerBlog: Next-Generation Blogging Platform</h1>' },
      context: { content: '<p>LayerBlog revolutionizes content creation and consumption through a multi-layered approach to content with integrated, contextual reader engagement.</p><h3>Key Innovations:</h3><ol><li>Dynamic Content Layers - Content organized in progressive depth levels</li><li>Contextual Engagement - Readers interact with specific text passages</li><li>Visual Engagement Indicators - Real-time feedback on content resonance</li></ol>' },
      detail: { content: '<h2>Content Layer System</h2><p>Content is organized into four distinct but interconnected layers:</p><ul><li><strong>Headline</strong> - Key points and main takeaways, first layer visible to all readers</li><li><strong>Context</strong> - Background information and definitions, provides necessary context</li><li><strong>Detail</strong> - In-depth analysis and technical information, deep dive for invested readers</li><li><strong>Discussion</strong> - Community insights and author responses, social layer for conversation</li></ul><h2>Micro-Engagement Features</h2><h3>Text-Level Appreciation</h3><p>Allows readers to "clap" for specific text passages they find valuable or insightful</p><h3>Inline Annotations</h3><p>Enables contextual comments tied to specific passages directly within the content</p>' },
      discussion: