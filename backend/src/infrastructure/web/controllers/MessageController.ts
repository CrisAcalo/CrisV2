import { Request, Response } from 'express';
import { MessageUseCases } from '../../../application/use-cases/MessageUseCases';

export class MessageController {
    constructor(private messageUseCases: MessageUseCases) { }

    getAllMessages = async (req: Request, res: Response): Promise<void> => {
        const messages = await this.messageUseCases.getAllMessages();
        res.json({ status: 'success', data: messages });
    }

    getMessageById = async (req: Request, res: Response): Promise<void> => {
        const message = await this.messageUseCases.getMessageById(req.params.id as string);
        res.json({ status: 'success', data: message });
    }

    createMessage = async (req: Request, res: Response): Promise<void> => {
        // Only map allowed fields for security in creation
        const message = await this.messageUseCases.createMessage({
            senderName: req.body.senderName,
            senderEmail: req.body.senderEmail,
            content: req.body.content
        });
        res.status(201).json({ status: 'success', data: message });
    }

    updateMessage = async (req: Request, res: Response): Promise<void> => {
        const message = await this.messageUseCases.updateMessage(req.params.id as string, req.body);
        res.json({ status: 'success', data: message });
    }

    deleteMessage = async (req: Request, res: Response): Promise<void> => {
        await this.messageUseCases.deleteMessage(req.params.id as string);
        res.status(204).send();
    }

    softDeleteMessage = async (req: Request, res: Response): Promise<void> => {
        await this.messageUseCases.softDeleteMessage(req.params.id as string);
        res.status(204).send();
    }

    restoreMessage = async (req: Request, res: Response): Promise<void> => {
        await this.messageUseCases.restoreMessage(req.params.id as string);
        res.status(204).send();
    }
}
