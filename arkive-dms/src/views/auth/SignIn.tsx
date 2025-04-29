import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import ForgetPasswordModal from "./components/ForgetPasswordModal";
import useAuth from "./auth.viewmodel";

export default function SignIn() {
  /* AuthForm data */
  const {
    email,
    password,
    setEmail,
    setPassword,
    handleLogin,
    loading,
    error,
    setError,
  } = useAuth();

  /* password */
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const {
    isOpen: isOpenForgetPasswordModal,
    onOpen: onOpenForgetPasswordModal,
    onClose: onCloseForgetPasswordModal,
  } = useDisclosure();

  return (
    <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      {/* Sign in section */}
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 ">Sign In</h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your email and password to sign in!
        </p>

        <div className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <FormControl id="email" isRequired size={"lg"}>
              <FormLabel>Email Address</FormLabel>
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="useruser@gmail.com"
                borderRadius="lg"
              />
            </FormControl>
          </div>

          {/* Password */}
          <div>
            <FormControl id="password" isRequired size={"lg"}>
              <FormLabel>Password</FormLabel>
              <InputGroup size="md">
                <Input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                  borderRadius="lg"
                />
                <InputRightElement width="4.5rem" borderRadius="lg">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={handleClick}
                    borderRadius="10px"
                  >
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </div>
        </div>
        <div className="mb-2 flex justify-end px-2">
          <div
            onClick={onOpenForgetPasswordModal}
            className="mt-2 cursor-pointer text-sm font-medium text-mainbrand hover:text-brand-600"
          >
            Forgot Password?
          </div>
        </div>
        <Button
          onClick={handleLogin}
          variant="brand"
          className={`linear mt-2 w-full rounded-xl py-[12px] text-base font-medium text-white transition duration-200
              active:bg-brand-800 ${
                loading
                  ? "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
                  : "bg-mainbrand hover:bg-brand-600"
              }`}
        >
          {loading ? <Spinner thickness="4px" size="sm" /> : "Sign In"}
        </Button>

        {error !== "" && (
          <div className="mt-4 rounded-md border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
      </div>

      <ForgetPasswordModal
        isOpen={isOpenForgetPasswordModal}
        onClose={onCloseForgetPasswordModal}
      />
    </div>
  );
}
