import { Request, Response, NextFunction } from "express";
import Controller from "./Controller";
import Account from "../schemas/Account";
import GenericValidator from "../validators/GenericValidator";

class AccountController extends Controller {
  constructor() {
    super("/account");
  }

  protected configureRoutes(): void {
    this.router.get(this.route, this.getAllAccounts);
    this.router.post(this.route, this.createAccount);
  }

  private async getAllAccounts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const accounts = await Account.find();
    return res.send(accounts);
  }

  private async createAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    let { cpf, password, name, email, phoneNumber, birthDate } = req.body;
    if (!cpf) cpf = req.query.cpf;
    if (!password) password = req.query.password;
    if (!name) name = req.query.name;
    if (!email) email = req.query.email;
    if (!phoneNumber) phoneNumber = req.query.phoneNumber;
    if (!birthDate) birthDate = req.query.birthDate;

    const validator: GenericValidator = new GenericValidator();

    let missingParams: Object = validator.checkRequiredParams(
      cpf,
      password,
      name,
      birthDate
    );
    if (JSON.stringify(missingParams) !== "{}") {
      return res.status(400).send(missingParams);
    }

    cpf = validator.validateCpf(cpf);
    if (!cpf) {
      return res.status(400).send({ message: "Invalid cpf." });
    }

    birthDate = validator.validateBirthDate(birthDate);
    if (!birthDate) {
      return res.status(400).send({ message: "Invalid birth date." });
    }

    if (email) {
      email = validator.validateEmail(email);
      if (!email) {
        return res.status(400).send({ message: "Invalid email." });
      }
    }

    name = validator.validateName(name);
    if (!name) {
      return res.status(400).send({ message: "Invalid name." });
    }

    if (phoneNumber) {
      phoneNumber = validator.validatePhoneNumber(phoneNumber);
      if (!phoneNumber) {
        return res.status(400).send({ message: "Invalid phone number." });
      }
    }

    const accountExists = await Account.findOne({ cpf });
    if (accountExists) {
      return res.status(400).send({ message: "Cpf already registered." });
    }

    try {
      await Account.create({
        ...(cpf && { cpf }),
        ...(password && { password }),
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(birthDate && { birthDate }),
      });
      res.status(201).send({ message: "Account created successfully." });
    } catch (error) {
      res
        .status(500)
        .send({
          message: `Error while creating new account: ${error.message}.`,
        });
    }
  }
}

export default AccountController;
