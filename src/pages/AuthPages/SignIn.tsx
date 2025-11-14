import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useSelector, useDispatch } from "react-redux";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Pricing Tool"
        description=""
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
