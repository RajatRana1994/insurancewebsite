<!DOCTYPE html>
<html lang="en-US">
    <head>
        <?php include("head.php"); ?>
    </head>
    <body>
        <header class="header header-light">
            <?php include("header.php"); ?>
        </header>
        <section class="banner">
            <div class="banner-content">
                <div class="banner-inner">
                    <div class="typed_wrap">
                        <h1 class="banner-title">Welcome to Defy Insurance!</h1>
                        <h4 class="subtitle">My name is Ramy, and I am excited to assist you. May I please have your name to get started?</h4>
                    </div>

                    <div class="d-flex justify-content-center ">
                        <form class="insurance-line-form">
                            <div class="form-field text-left">
                                <div class="form-field__control">
                                    <label class="form-field__label">First Name</label>
                                    <input type="text" class="form-field__input">
                                </div>
                            </div>
                            <div class="zipCode d-flex justify-content-center mt-3">
                                <div class="form-field text-left">
                                    <div class="form-field__control with-icon">
                                        <label class="form-field__label">Zip Code</label>
                                        <input type="text" class="form-field__input" />
                                        <span class="icon">
                                            <svg version="1.1" class="place"  x="0px" y="0px" width="30px" height="30px" viewBox="0 0 513.597 513.597"><g><path d="M263.278,0.107C158.977-3.408,73.323,80.095,73.323,183.602c0,117.469,112.73,202.72,175.915,325.322 c3.208,6.225,12.169,6.233,15.388,0.009c57.16-110.317,154.854-184.291,172.959-290.569 C456.331,108.387,374.776,3.866,263.278,0.107z M256.923,279.773c-53.113,0-96.171-43.059-96.171-96.171 s43.059-96.171,96.171-96.171c53.113,0,96.172,43.059,96.172,96.171S310.036,279.773,256.923,279.773z"/></g></svg>
                                        </span>
                                    </div>
                                </div>
                                <button class="btn btn-primary">Continue</button>
                            </div>
                        </form>
                    </div>
                    <div class="text-center mt-4">
                        <a class="btn btn-primary" href="#">Call Us</a>
                        <a class="btn btn-primary" href="#">Email Us</a>
                    </div>
                </div>
            </div>
        </section>
        <!-- Footer Starts -->
        <?php include("footer.php"); ?>
        <!-- Footer Ends -->
    </body>

</html>