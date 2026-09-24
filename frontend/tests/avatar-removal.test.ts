import assert from "node:assert/strict";
import test from "node:test";
import {
  avatarAfterSave,
  cancelStagedAvatar,
  confirmAvatarRemoval,
  hasAvatarChanges,
  isManagedMemberAvatarPath,
  shouldDeletePreviousAvatar,
  type AvatarRemovalState,
} from "../src/lib/avatarRemoval";

const internalAvatar = "members/123e4567-e89b-12d3-a456-426614174000.webp";
const externalAvatar = "https://cdn.discordapp.com/avatar.png";

async function saveAvatar(previousAvatar: string | null, state: AvatarRemovalState, dbSucceeds: boolean) {
  const nextAvatar = avatarAfterSave(state, previousAvatar, null, "https://api.dicebear.com/fallback.svg");
  let deleted: string[] = [];
  const updated = dbSucceeds;
  if (updated && shouldDeletePreviousAvatar(previousAvatar, nextAvatar)) deleted = [previousAvatar];
  return { avatar: updated ? nextAvatar : previousAvatar, deleted };
}

test("existing internal avatar becomes null after removal", async () => {
  const result = await saveAvatar(internalAvatar, confirmAvatarRemoval(), true);
  assert.equal(result.avatar, null);
});

test("internal storage cleanup occurs after DB success", async () => {
  const result = await saveAvatar(internalAvatar, confirmAvatarRemoval(), true);
  assert.deepEqual(result.deleted, [internalAvatar]);
});

test("DB failure does not delete the old object", async () => {
  const result = await saveAvatar(internalAvatar, confirmAvatarRemoval(), false);
  assert.equal(result.avatar, internalAvatar);
  assert.deepEqual(result.deleted, []);
});

test("external avatar becomes null without storage cleanup", async () => {
  const result = await saveAvatar(externalAvatar, confirmAvatarRemoval(), true);
  assert.equal(result.avatar, null);
  assert.deepEqual(result.deleted, []);
});

test("staged manual file is cancelled without upload", () => {
  const file = new File(["photo"], "photo.webp", { type: "image/webp" });
  const result = cancelStagedAvatar({ avatar: file, selectedSubmission: false, removalRequested: false }, internalAvatar);
  assert.equal(result.avatar, internalAvatar);
  assert.equal(result.removalRequested, false);
});

test("staged submission is cancelled without changing avatar", () => {
  const result = cancelStagedAvatar({ avatar: internalAvatar, selectedSubmission: true, removalRequested: false }, internalAvatar);
  assert.equal(result.selectedSubmission, false);
  assert.equal(result.avatar, internalAvatar);
});

test("cancelling a staged submission leaves it pending", () => {
  const result = cancelStagedAvatar({ avatar: internalAvatar, selectedSubmission: true, removalRequested: false }, internalAvatar);
  assert.equal(result.removalRequested, false);
  assert.equal(result.avatar, internalAvatar);
});

test("removal-only change marks editor dirty", () => {
  assert.equal(hasAvatarChanges({ avatar: null, selectedSubmission: false, removalRequested: true }, internalAvatar, false), true);
});

test("removal-only save succeeds", async () => {
  const result = await saveAvatar(internalAvatar, confirmAvatarRemoval(), true);
  assert.equal(result.avatar, null);
});

test("successful save resolves to a clean removal state", () => {
  const state = confirmAvatarRemoval();
  const saved = avatarAfterSave(state, internalAvatar, null, "fallback");
  const clean: AvatarRemovalState = { avatar: saved, selectedSubmission: false, removalRequested: false };
  assert.equal(hasAvatarChanges(clean, saved, false), false);
});

test("failed save keeps removal state for retry", async () => {
  const state = confirmAvatarRemoval();
  await saveAvatar(internalAvatar, state, false);
  assert.equal(state.removalRequested, true);
  assert.equal(state.avatar, null);
});

test("arbitrary external URLs cannot trigger storage deletion", () => {
  assert.equal(isManagedMemberAvatarPath(externalAvatar), false);
  assert.equal(isManagedMemberAvatarPath("https://example.com/members/avatar.webp"), false);
  assert.equal(isManagedMemberAvatarPath("member-submissions/pending.webp"), false);
  assert.equal(isManagedMemberAvatarPath(internalAvatar), true);
});
