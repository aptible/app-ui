import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import { logout } from "@app/auth";
import { loginUrl } from "@app/routes";

import { Button } from "../shared";

export const LogoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(logout());
    navigate(loginUrl());
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={onSubmit}>
            <Button type="submit" variant="primary" layout="block" size="lg">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
