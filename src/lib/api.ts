type ImageTag = {
    digest: string;
    schemaVersion: number
    name: string
    tag: string
    architecture: string
    fsLayers: Array<{
        blobSum: string
    }>
    history: Array<{
        v1Compatibility: string
    }>
    signatures: Array<{
        header: {
            jwk: {
                crv: string
                kid: string
                kty: string
                x: string
                y: string
            }
            alg: string
        }
        signature: string
        protected: string
    }>
}


type Tags = {
    name: string;
    tags: string[];
};

export const tagsFetcher = async (repository: string): Promise<Tags> =>
    await fetch(`/v2/${encodeURIComponent(repository)}/tags/list`, {
        credentials: "include",
        headers: new Headers({
            Authorization: "Basic " + btoa(`overlord:itadakimasu`),
            "Content-Type": "application/json",
        }),
    }).then((response) => response.json());

export const fetchTagSize = async (image: string, digest: string): Promise<number> =>
    await fetch(`/v2/${encodeURIComponent(image)}/blobs/${digest}`, {
        credentials: "include",
        headers: new Headers({
            Authorization: "Basic " + btoa(`overlord:itadakimasu`),
            "Content-Type": "application/json",
        }),
    }).then((response) => parseInt(response.headers.get("Content-Length") as string));

export const fetchImage = async (repository: string, tag: string): Promise<ImageTag> =>
    await fetch(`/v2/${encodeURIComponent(repository)}/manifests/${encodeURIComponent(tag)}`, {
        credentials: "include",
        headers: new Headers({
            Authorization: "Basic " + btoa(`overlord:itadakimasu`),
            "Content-Type": "application/json",
        }),
    }).then(async (response) => ({
        ...await response.json(),
        digest: response.headers.get("Docker-Content-Digest")
    }));

export const deleteImageTag = async (repository: string, tagOrDigest: string): Promise<void> =>
    await fetch(`/v2/${encodeURIComponent(repository)}/manifests/${tagOrDigest.startsWith("sha256:") ? tagOrDigest : encodeURIComponent(tagOrDigest)}`, {
        credentials: "include",
        headers: new Headers({
            Authorization: "Basic " + btoa(`overlord:itadakimasu`),
            "Content-Type": "application/json",
        }),
        method: "DELETE"
    }).then(() => { });