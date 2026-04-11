export interface StoryCard {
    id: string;
    title: string;
    filePath: string;
    description?: string;
    metadata: Record<string, unknown>;
}

export type BoardState = {
    columns: { [status: string]: StoryCard[] };
    completedDates?: string[];
    sprintGroups?: Record<string, StoryCard[]>;
    epicGroups?: Record<string, StoryCard[]>;
};
