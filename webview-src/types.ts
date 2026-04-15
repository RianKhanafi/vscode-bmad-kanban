export type ArtifactFolderType = 'ticket' | 'document' | 'mockup';

export interface StoryCard {
    id: string;
    title: string;
    filePath: string;
    description?: string;
    metadata: Record<string, unknown>;
    sourceType?: ArtifactFolderType;
    fileType?: 'md' | 'html';
}

export type BoardState = {
    columns: { [status: string]: StoryCard[] };
    completedDates?: string[];
    sprintGroups?: Record<string, StoryCard[]>;
    epicGroups?: Record<string, StoryCard[]>;
    mockupsCards?: StoryCard[];
    hasMockups?: boolean;
    emptyState?: boolean;
};
