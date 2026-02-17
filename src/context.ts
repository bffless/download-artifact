import * as github from '@actions/github';
import { GitContext } from './types';

export function deriveContext(): GitContext {
  const { context } = github;
  const repository = context.repo.owner + '/' + context.repo.repo;

  return { repository };
}
