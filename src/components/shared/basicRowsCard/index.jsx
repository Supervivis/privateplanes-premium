import React from "react";

const BasicRowsCard = ({ titleOne, contentOne, titleTwo, contentTwo, titleThree, contentThree, titleFour, contentFour }) => {

  const titleClasses = "pb-2 text-lg lg:text-xl";
  const contentClasses = "pl-4 font-bold text-lg lg:text-xl";

  return (
    <div className="card p-6">
      <table className="table-auto w-full h-full">
        <tbody>
          <tr>
            <td className={titleClasses}>{titleOne}</td>
            <td className={contentClasses}>{contentOne}</td>
          </tr>
          <tr>
            <td className={titleClasses}>{titleTwo}</td>
            <td className={contentClasses}>{contentTwo}</td>
          </tr>
          <tr>
            <td className={titleClasses}>{titleThree}</td>
            <td className={contentClasses}>{contentThree}</td>
          </tr>
          {titleFour && contentFour &&
          <tr>
            <td className={titleClasses}>{titleFour}</td>
            <td className={contentClasses}>{contentFour}</td>
          </tr>}
        </tbody>
      </table>
    </div>
  );
};

export default BasicRowsCard;