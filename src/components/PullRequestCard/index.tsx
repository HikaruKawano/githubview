import { Stack, Typography, Card as MuiCard } from '@mui/material';

interface PullRequestCardProps {
    title: string;
    assignee?: string;
    prUrl: string;
}

export function PullRequestCard({ title, assignee, prUrl }: PullRequestCardProps) {
    const handleOpenPR = () => {
        window.open(prUrl); // Abre no navegador padrão do sistema
    };

    return (
        <MuiCard
            sx={{
                marginBottom: 2,
                padding: 2,
                borderRadius: 3,
                boxShadow: 2,
                transition: 'transform 0.2s',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)' },
            }}
            onClick={handleOpenPR}
        >
            <Stack>
                <Typography color="black" variant="h6">{title}</Typography>
                {assignee && (
                    <Typography color="gray" variant="body2">👤 {assignee}</Typography>
                )}
            </Stack>
        </MuiCard>
    );
}
