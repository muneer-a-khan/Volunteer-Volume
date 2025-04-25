import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { mapSnakeToCamel } from '@/lib/map-utils';
import { json2csv } from 'json-2-csv';
import { format } from 'date-fns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;
    const { startDate, endDate } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid group ID' });
    }
    if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        return res.status(400).json({ message: 'Start date and end date are required' });
    }

    try {
        await prisma.$connect();

        const logs = await prisma.volunteer_logs.findMany({
            where: {
                group_id: id,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
                approved: true,
            },
            include: {
                users: true,
            },
            orderBy: {
                date: 'asc',
            },
        });

        if (logs.length === 0) {
            return res.status(404).json({ message: 'No approved logs found for this group and date range.' });
        }

        const csvData = logs.map(log => ({
            VolunteerName: log.users?.name || 'Unknown',
            Email: log.users?.email || 'N/A',
            Date: format(new Date(log.date), 'yyyy-MM-dd'),
            Hours: log.hours,
            Minutes: log.minutes,
            Description: log.description,
        }));

        const csv = await json2csv(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=group-${id}-hours-report-${format(new Date(), 'yyyyMMdd')}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Error generating hours report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        await prisma.$disconnect();
    }
} 