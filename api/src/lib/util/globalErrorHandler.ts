// export interface IGlobalErrorHandler {
//   message: string;
//   name: string | string[];
//   statusCode: number;
//   operational: boolean;
//   //   type: string;
// }
export class GlobalErrorHandler extends Error {
  statusCode;
  operational;
  //   type;
  constructor(
    name: string,
    msg: string,
    statusCode: number,
    operational: boolean
    // type: string
  ) {
    super(msg);
    this.name = name;
    this.statusCode = statusCode;
    this.operational = operational;
    // this.type = type;
  }
}
