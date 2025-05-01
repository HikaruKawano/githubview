// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import type { Socket } from 'net';

interface Repository {
  name: string;
  owner: string;
}

interface PullRequest {
  title: string;
  url: string;
  owner: string;
  repo: string;
  prUrl: string;
  state: string;
  createdAt: string;
  daysOpen: number;
  reviewCommentsCount: number;
  resolvedComments: number;
  approved: boolean;
}

interface UserData {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  company: string;
  email: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
}

const repos: Repository[] = [];
const pullRequests: PullRequest[] = [];
let userData: UserData | null = null;

function calculateDaysOpen(createdAt: string): number {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - createdDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const payload = req.body;

  if (payload.pull_request) {
    const pr = payload.pull_request;
    const owner = payload.repository?.owner?.login || payload.sender?.login;
    const repo = payload.repository?.name;

    const existing = pullRequests.find(p => p.prUrl === pr.html_url);
    if (!existing) {
      pullRequests.push({
        title: pr.title,
        url: pr.html_url,
        owner,
        repo,
        prUrl: pr.html_url,
        state: pr.state,
        createdAt: pr.created_at,
        daysOpen: calculateDaysOpen(pr.created_at),
        reviewCommentsCount: 0,
        resolvedComments: 0,
        approved: false,
      });
    }
  }

  if (payload.review && payload.pull_request) {
    const prUrl = payload.pull_request.html_url;
    const reviewState = payload.review.state;

    const pr = pullRequests.find(p => p.prUrl === prUrl);
    if (pr && reviewState === 'APPROVED') {
      pr.approved = true;
    }
  }

  if (payload.comment && payload.pull_request) {
    const prUrl = payload.pull_request.html_url;
    const isResolved = payload.comment.isResolved || false;

    const pr = pullRequests.find(p => p.prUrl === prUrl);
    if (pr) {
      pr.reviewCommentsCount += 1;
      if (isResolved) {
        pr.resolvedComments += 1;
      }
    }
  }

  // 🔥 EMITIR EVENTO VIA SOCKET.IO 🔥
  if (res.socket.server.io) {
    res.socket.server.io.emit('new-webhook-event', payload); // Envia para todos os clientes
  }

  res.status(200).json({ message: 'Webhook recebido e evento enviado via socket.' });
}

export { repos, pullRequests, userData };
