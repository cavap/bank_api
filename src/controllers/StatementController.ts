import { Request, Response, NextFunction } from "express";
import Controller from "./Controller";
import Account from "../schemas/Account";
import Operation from "../schemas/Operation";

class StatementController extends Controller {

    constructor() {
        super("/statement");
    }

    protected configureRoutes(): void {
        this.router.post(this.route, this.jwtValidation, this.checkStatement);
    }

    protected async checkStatement(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> {
        let cpf = req.body.cpf;
        let { month } = req.body;

        const account = await Account.findOne({ cpf: cpf });

        if (account) {

            let operationsHistory = new Array;
            for (let i = 0; i < account.operationsHistory.length; i++) {
                let id = account.operationsHistory[i].toString();
                const operation = await Operation.findById(id).exec();

                let { operationType, amount, operationDate } = operation;

                let now = new Date();
                console.log(now);

                let begin = new Date(`${month}/01/${now.getFullYear()}`);
                let end = new Date(`${month + 1}/01/${now.getFullYear()}`);

                let objectReturn = {
                    ...{ operationType }, ...{ amount }, ...{ operationDate }
                };

                if(month){
                    if(operationDate.getTime() < end.getTime() && operationDate.getTime() >= begin.getTime()){
                        operationsHistory.push(objectReturn);
                    }
                }
                else{
                    operationsHistory.push(objectReturn);
                }

            }
            
            let totalStatement = { operationsHistory: operationsHistory, balance: account.balance }
            return res.send(totalStatement);
        }

        return res.status(500).send({});
    }

}

export default StatementController;