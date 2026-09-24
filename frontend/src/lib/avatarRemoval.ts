export function isManagedMemberAvatarPath(value: string | null | undefined): value is string {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.startsWith("members/") && !trimmed.includes("..") && !trimmed.includes("\\") && trimmed.length > "members/".length;
}

export interface AvatarRemovalState {
  avatar: string | File | null;
  selectedSubmission: boolean;
  removalRequested: boolean;
}

export function hasAvatarChanges(
  current: AvatarRemovalState,
  initialAvatar: string | null,
  normalFieldsChanged: boolean,
): boolean {
  return normalFieldsChanged || current.selectedSubmission || current.removalRequested || current.avatar !== initialAvatar;
}

export function cancelStagedAvatar(
  current: AvatarRemovalState,
  initialAvatar: string | null,
): AvatarRemovalState {
  if (current.selectedSubmission) {
    return { ...current, selectedSubmission: false };
  }
  if (current.avatar instanceof File) {
    return { avatar: initialAvatar, selectedSubmission: false, removalRequested: false };
  }
  return current;
}

export function confirmAvatarRemoval(): AvatarRemovalState {
  return { avatar: null, selectedSubmission: false, removalRequested: true };
}

export function shouldDeletePreviousAvatar(previousAvatar: string | null, nextAvatar: string | null): previousAvatar is string {
  return previousAvatar !== nextAvatar && isManagedMemberAvatarPath(previousAvatar);
}

export function avatarAfterSave(
  state: AvatarRemovalState,
  previousAvatar: string | null,
  uploadedPath: string | null,
  fallbackAvatar: string,
): string | null {
  if (state.removalRequested) return null;
  if (uploadedPath) return uploadedPath;
  if (typeof state.avatar === "string" && state.avatar.trim()) return state.avatar.trim();
  return previousAvatar || fallbackAvatar;
}
