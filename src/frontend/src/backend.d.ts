import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DashboardStats {
    totalSegments: bigint;
    totalCustomers: bigint;
    averageCustomerValue: number;
    topRevenueSegment: string;
}
export interface Segment {
    id: bigint;
    name: string;
    createdAt: bigint;
    ageMax: bigint;
    ageMin: bigint;
    description: string;
    incomeMax: bigint;
    incomeMin: bigint;
    revenueContribution: number;
    accountTypes: Array<string>;
    riskProfile: string;
    customerCount: bigint;
}
export interface DatasetMetadata {
    id: bigint;
    filename: string;
    uploadedAt: bigint;
    rowCount: bigint;
    columns: Array<string>;
    blobId: string;
    status: string;
}
export interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    createSegment(segment: Segment): Promise<bigint>;
    deleteSegment(id: bigint): Promise<void>;
    getAllSegments(): Promise<Array<Segment>>;
    getDashboardStats(): Promise<DashboardStats>;
    getSegmentById(id: bigint): Promise<Segment>;
    seedSegments(): Promise<void>;
    updateSegment(id: bigint, segment: Segment): Promise<void>;
    saveDatasetMetadata(filename: string, rowCount: bigint, columns: Array<string>, blobId: string): Promise<bigint>;
    getDatasetHistory(): Promise<Array<DatasetMetadata>>;
    deleteDataset(id: bigint): Promise<void>;
}
