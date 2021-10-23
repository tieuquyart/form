
// Đối tượng Validator
function Validator (options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }   
    }

    var selectorRules = {};

    // Hàm thực hiện validate
    function Validate(inputElement,rule) {
        var errorElement = getParent(inputElement,options.formGroupSelect).querySelector(options.errorSelector);
        var errorMessage ;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng
        
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio' :
                case 'checkbox' :
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break ;
        }

        if (errorMessage) {
          errorElement.innerHTML = errorMessage;
          getParent(inputElement,options.formGroupSelect).classList.add('invalid')
        }else
        {
          errorElement.innerHTML = '';
          getParent(inputElement,options.formGroupSelect).classList.remove('invalid')
        }

        return !errorMessage;

    }
    // lấy Element của form cần validate
   var formElement = document.querySelector(options.form);
   if (formElement) {
       // khi submit form
       formElement.onsubmit = function(e) {
           e.preventDefault();

           var isFormValid =  true; 
        
        // Lặp qua từng rules và validate
           options.rules.forEach(function (rule) {
            var inputElement = formElement.querySelector(rule.selector);
            var isValid  = Validate(inputElement, rule)
            if (!isValid) {
                isFormValid = false;
            }
           });
            
           if (isFormValid) {
               // trường hợp submit với Js
              if(typeof options.onSubmit === 'function') {
                var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                var formValues = Array.from(enableInputs).reduce(function(values,input) {
                    
                    switch(input.type) {
                        case 'radio':
                        case 'checkbox':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        default:
                            values[input.name] = input.value;

                    }

                     return  values; 
              }, {});
              

              options.onSubmit(formValues);
            }
            // trường hợp submit với hành vi mặc định
            else {
                formElement.submit();
            }
        }
    }


        // lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur,input,..)
    options.rules.forEach(function (rule) {

        // lưu lại  các rules cho mỗi input 
        if (Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test);
        }else{
            selectorRules[rule.selector] = [rule.test];
        }

        var inputElements = formElement.querySelectorAll(rule.selector);

        Array.from(inputElements).forEach(function (inputElement) {
        
            if (inputElement) {
                // xử lý trường hợp blur ra khỏi input
                inputElement.onblur = function () {
                    Validate(inputElement, rule)
                }
                // xử lý mỗi khi người dùng nhập vào input 
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement,options.formGroupSelect).querySelector(options.errorSelector);
                    errorElement.innerHTML = '';
                    getParent(inputElement,options.formGroupSelect).classList.remove('invalid')
                }
            }        
        });
        
    });


   }
}

// Định nghĩa rules
// Nguyên tắc của các rules : 1 Khi có lỗi thì trả ra mes lỗi
// 2 Khi hợp lệ => không trả ra gì (udf)
Validator.isRequired = function (selector, message) {
    return { 
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
     return { 
        selector: selector,
        test: function (value) {
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ ;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập Email'
        }
    }
} 
Validator.minLength = function (selector, min , message) {
    return { 
       selector: selector,
       test: function (value) {
           return value.length >= min ? undefined : message || `Giá trị nhập tổi thiểu ${min} kí tự`;
       }
   }
} 
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test : function (value) {
            return value === getConfirmValue() ? undefined : message ||  'Giá trị nhập vào không chính xác'
        }
    }
}