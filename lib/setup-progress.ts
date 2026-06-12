export type SetupStats = {
  activeClients: number
  totalProjects: number
  filesShared: number
  feedbackCount: number
  approvalCount: number
  portalLinksCount?: number
}

export type SetupProject = {
  portal_shared_at?: string | null
}

export function getSetupSteps(stats: SetupStats, projects: SetupProject[]) {
  const hasClient = stats.activeClients > 0
  const hasProject = stats.totalProjects > 0
  const hasFile = stats.filesShared > 0
  const hasDirectPortalShare = projects.some((project) => Boolean(project.portal_shared_at))
  const hasFeedbackOrApproval = (stats.feedbackCount ?? 0) > 0 || (stats.approvalCount ?? 0) > 0
  const hasPortalShare = hasDirectPortalShare || hasFeedbackOrApproval

  let step1 = hasClient
  let step2 = hasProject
  let step3 = hasFile
  let step4 = hasPortalShare
  let step5 = hasFeedbackOrApproval

  if (step5) { step4 = true; step3 = true; step2 = true; step1 = true }
  if (step4) { step3 = true; step2 = true; step1 = true }
  if (step3) { step2 = true; step1 = true }
  if (step2) { step1 = true }

  return [step1, step2, step3, step4, step5]
}
