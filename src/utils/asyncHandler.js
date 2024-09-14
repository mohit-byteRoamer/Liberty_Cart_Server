const asyncHandler = (reqHandler) => {
  return (req, res, next) =>
    Promise.resolve(
      reqHandler(req, res, next).catch((error) => {
        console.log("EERROORR", error);
        next(error);
      })
    );
};

export { asyncHandler };
