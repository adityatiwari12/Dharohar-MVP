import wariImg from '../assets/wari_tribe.jpg';
import gondImg from '../assets/gond_community.jpg';
import defaultImg from '../assets/image.png';

export interface BioKnowledge {
    id: string;
    title: string;
    summary: string;
    fullDescription: string;
    riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
    licenseType: 'COMMUNITY_CONSENT' | 'RESEARCH_ONLY' | 'COMMERCIAL';
    attribution: string;
    // Enhanced Phase 3 Fields
    region?: string;
    location?: string; // GPS Coordinates
    category?: 'MEDICINAL' | 'AGRICULTURAL' | 'ECOLOGICAL' | 'RITUAL';
    preparationProcess?: string; // Hidden behind license
    usageContext?: string; // Hidden behind license
    tribalMember?: string; // Submitting individual
    timestamp?: string;
    voiceNote?: string; // URL to recording
}

export interface MusicTrack {
    id: string;
    title: string;
    duration: string;
    audioFile: string;
    licenseType: string;
    attribution: string;
    // Enhanced Phase 3 Fields
    performanceContext?: 'FESTIVAL' | 'RITUAL' | 'AGRICULTURAL' | 'CELEBRATION';
    lyrics?: string;
    instrumentation?: string;
    culturalMeaning?: string;
    videoFile?: string; // Optional video
    location?: string;
    tribalMember?: string;
    timestamp?: string;
    fingerprint?: string; // Audio hash
}

export interface MediaItem {
    id: string;
    title: string;
    thumbnail: string;
    description: string;
}

export interface Community {
    id: string;
    name: string;
    region: string;
    culturalIdentity: string;
    description: string;
    image: string;
    bioKnowledge: BioKnowledge[];
    music: MusicTrack[];
    videos: MediaItem[];
}

export const mockCommunities: Community[] = [
    {
        id: 'warli',
        name: 'Warli Tribe',
        region: 'Maharashtra',
        culturalIdentity: 'Traditional mural art and harmony with nature.',
        description: 'The Warli community is known for their distinctive art style that uses geometric shapes to depict daily life, nature, and rituals. They have a deep-rooted belief in the sacredness of nature.',
        image: wariImg,
        bioKnowledge: [
            {
                id: 'bk-w1',
                title: 'Digestive Herbal Infusion',
                summary: 'A traditional remedy using local tree bark.',
                fullDescription: 'This infusion is prepared using specific medicinal leaves found in the Western Ghats. It has been used for generations to treat stomach ailments and improve digestion.',
                riskTier: 'LOW',
                licenseType: 'COMMERCIAL',
                attribution: 'Preserved by: Warli Community Council\nRecorded under: Cultural Governance Framework'
            }
        ],
        music: [
            {
                id: 'm-w1',
                title: 'Harvest Song',
                duration: '3:45',
                audioFile: '#',
                licenseType: 'COMMUNITY_CONSENT',
                attribution: 'Preserved by: Warli Ritual Singers\nRecorded under: Cultural Governance Framework'
            }
        ],
        videos: [
            {
                id: 'v-w1',
                title: 'Annual Tarpa Dance',
                thumbnail: defaultImg,
                description: 'Archived under structured community consent.'
            }
        ]
    },
    {
        id: 'gond',
        name: 'Gond Community',
        region: 'Madhya Pradesh',
        culturalIdentity: 'Intricate pointillist storytelling art.',
        description: 'The Gond people have a rich tradition of painting that illustrates their deep connection with nature, myths, and legends. Their knowledge extends to forest ecology and sustainable practices.',
        image: gondImg,
        bioKnowledge: [
            {
                id: 'bk-g1',
                title: 'Forest Water Conservation Technique',
                summary: 'Methods for retaining water in dry areas.',
                fullDescription: 'Using specific rock formations and native plant root systems, this traditional ecological knowledge helps maintain soil moisture throughout the dry season.',
                riskTier: 'MEDIUM',
                licenseType: 'RESEARCH_ONLY',
                attribution: 'Preserved by: Gond Knowledge Keepers\nRecorded under: Cultural Governance Framework'
            }
        ],
        music: [
            {
                id: 'm-g1',
                title: 'Monsoon Drum Invocation',
                duration: '5:10',
                audioFile: '#',
                licenseType: 'COMMUNITY_CONSENT',
                attribution: 'Preserved by: Gond Ritual Musicians\nRecorded under: Cultural Governance Framework'
            }
        ],
        videos: []
    }
];

// Flat arrays for marketplace
export const allMarketplaceAssets = mockCommunities.flatMap(c => {
    const assets: any[] = [];
    c.bioKnowledge.forEach(bk => assets.push({ ...bk, type: 'BIO', communityName: c.name, communityId: c.id }));
    c.music.forEach(m => assets.push({ ...m, type: 'SONIC', communityName: c.name, communityId: c.id }));
    return assets;
});

export const mockPendingAssets = [
    {
        id: 'pa-1',
        title: 'Traditional Bamboo Weaving technique',
        communityName: 'Warli Tribe',
        type: 'BIO',
        riskTier: 'LOW',
        description: 'A sustainable method of creating durable baskets using specifically aged local bamboo.',
        submittedDate: '2023-10-25'
    },
    {
        id: 'pa-2',
        title: 'Monsoon Chants of the Forest',
        communityName: 'Gond Community',
        type: 'SONIC',
        riskTier: 'MEDIUM',
        description: 'Audio documentation of the three-day monsoon welcoming chant.',
        submittedDate: '2023-11-02'
    }
];

export const mockLicenseRequests = [
    {
        id: 'lr-1',
        assetTitle: 'Digestive Herbal Infusion',
        communityName: 'Warli Tribe',
        applicant: 'Global Pharma Research Ltd.',
        intendedUse: 'COMMERCIAL',
        status: 'PENDING',
        requestDate: '2023-11-10',
        justification: 'We intend to research the active compounds for a new line of organic digestive aids, with profit-sharing governed by the DHAROHAR framework.'
    },
    {
        id: 'lr-2',
        assetTitle: 'Forest Water Conservation Technique',
        communityName: 'Gond Community',
        applicant: 'National Ecological Institute',
        intendedUse: 'RESEARCH_ONLY',
        status: 'PENDING',
        requestDate: '2023-11-12',
        justification: 'Academic study to document the efficacy of traditional water retention against modern climate stress.'
    }
];
