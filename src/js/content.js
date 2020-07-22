let hasDownloadableLinks = true;
let lastURL = window.location.href;

$(document).ready(function() {

    function getUpdateButtonPromise() {

        const updateButtonPromise =
            fetch(getCmrQueryLink(window.location.href, false))
            .then(res => res.json())
            .then((out) => {
                const entries = out['feed']['entry'];
                if (entries.length == 0) {
                    hasDownloadableLinks = false;
                    return false;
                } else {
                    hasDownloadableLinks = true;
                    return true;
                }
            })
            .then(updateButton())
            .catch(err => console.error(err));

        return updateButtonPromise;
    }

    function getCmrFilters(url, withFilters = true) {

        let filter = {};
        let conceptId = getUrlVars(url)["p"];

        if (!conceptId) {
            return {};
        }

        if (conceptId.indexOf("!") > 0) {
            conceptId = conceptId.substring(conceptId.lastIndexOf('!') + 1);
        }
        let temporalGranule = getUrlVars(url)["pg[0][qt]"] || getUrlVars(url)["pg[1][qt]"] || getUrlVars(url)["pg[2][qt]"]; //This is because of the inconsistency in the URL
        let polygon = getUrlVars(url)["polygon"];
        let rectangle = getUrlVars(url)["sb"];
        let point = getUrlVars(url)["sp"];
        let temporalGlobal = getUrlVars(url)["qt"];
        filter['concept_id'] = "?collection_concept_id=" + conceptId;
        filter['temporal'] = "&temporal[]=";
        filter['polygon'] = "&polygon=";
        filter['rectangle'] = "&bounding_box=";
        filter['point'] = "&point=";

        if (!withFilters) {
            return filter;
        }

        if (temporalGranule)
            filter['temporal'] = filter['temporal'] + temporalGranule;
        else if (temporalGlobal)
            filter['temporal'] = filter['temporal'] + temporalGlobal;


        if (polygon)
            filter['polygon'] = "&polygon=" + polygon;
        if (rectangle)
            filter['rectangle'] = "&bounding_box=" + rectangle;
        if (point)
            filter['point'] = "&point=" + point;
        return filter;
    }

    function getCmrQueryLink(url, withFilters = true) {
        let filter = getCmrFilters(url, withFilters);
        let baseUrl = "https://cmr.earthdata.nasa.gov/search/granules.json";

        if (filter.length == 0) {
            return baseUrl;
        }

        let link = (baseUrl + filter['concept_id'] + filter['polygon'] + filter['rectangle'] + filter['point'] + filter['temporal'] + "&downloadable=true&page_size=700&page_num=");

        if (!withFilters) {
            link = link + [1];
        }
        return link;
    }

    function downloadFiles() {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timerProgressBar: true,
            html: ' <h4> Download started...!</h4> <p style="text-align:left"> Click on the  <img width="25" alt="DHIS Logo" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3NDM0OTRDMkRGNzNFODExOTI2OEE4RjYzQ0MwNDQ5OSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxNTMxRTU4Nzc1NkUxMUU4QjFEQkIxOUU0ODU3OUMzRiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxNTMxRTU4Njc1NkUxMUU4QjFEQkIxOUU0ODU3OUMzRiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkNBOTc4OTk5RjE3M0U4MTE5MjY4QThGNjNDQzA0NDk5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjc0MzQ5NEMyREY3M0U4MTE5MjY4QThGNjNDQzA0NDk5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VEpLTwAAEFpJREFUeNq8WnmQFNd5/3X39Fy7s7P3fbILy3LscoO4dIFlULCRkWOXS0kcO2VFpZRAyR+uSqpSSaUUlytJSYqdYNkpOa4oiVyxBEJEJAiDEIeEOPZkWZY92At2Z6/ZmdmZ6enp6Xzf69nhWtAiUF7Vx5vt6Xnv933vux/Sks078TBGeN1zS21jV/9IivhXSrHwfJjwyBG/a+b7hCszAglB0+6+YjozLsTz5v3C/elbrQ+6r/QgDERWf2uFMtb7F3J4cpviv+aS9ChMSaZVJV46OSeHafI/YpbMBEzVCSOzOJJwZx0ycqtecZ399YX/NwaiS7Y9ZRu/ulcZ66mSDAOmrABJYgYkmwozYcLmyYak2mHqMZjxGIxIgI4iIRhAwhAkEZmKAiN3Xm88p/IFZ9uh//3SGIis2FVuG+44oPquNJgsUdkGKDYCoIrPaWUL4MrKg7+vA+7sQhTXLRMHwYJP0PtMWjSC0Oh1RHyD0MavA9o0YMTphTgdmAQ9f35zvKjuGdf53/TOBZNttoetx/fd8WzB8//4x47O4z+Vw36FAZuqCjW7GHEtgryFKxDyDcFG0h7p7SRmVHidLjgSGjIyvUKdGLxBp2KkORDzZiBWWYNoVEPPR/sh0enAIIrrUIcvNyiBkSvawsf/pPONl352O46ljz5zy9/yXLis/e6P9jm6Tu2VogGFdZcMEaYjHZoWhaE4hXrULF2OQESD6fKSwXox7A/hXEs7nKRZBV53ivIzmFzIIzLDflrHg4QzXawn1qX1eR/ej/f9QicwM6p/+I5dHWo7YR9qXWNJ3QlXyXzxXXp2HoKBAArLyhGPx4U0Hd5saOGYZQ9JY1aI8r0uOgESspGAThRj0g00TfqJ2Qw6AQ0gBwBWRZ0g6fR7embvO79z4XN/fUYvWbKp+8e7YvfNgHq9/ZgqwNsBklLOskeRV1KG0Z4OxAnRyjWrcd03ji1rGmC3yTjW3I22/tEkeJlUXwJpNnI9rpQKxRl8PIHhiQDGwmTETg+BtQs7knQiYl5K/p5Vj/eHLB8Ddm2YDeNdVaj2D/72PXWgeb0A785A3uqtQtrTZHzjk1OoqKxEKByF4nCi+9o4PC47fu+JZdi4tBqmzWEZNhl4Q2UBstKcyGZKtyhOnui9s12W2hAleCZGTBJSRlE5ajZvR+GGrwFpXvD+jIPxzIZTya9YeMfD1z4dfdHed+5loQruTLiK5iEjKxtOmdQhNwerli3BgrICTIY15Gd5cahlAM19Y/idFVWoK87Ch/Q3S7y6wItvrpsPh6rQCVnU65vCPx9uRVAzLC+WcsEyXE4nNj6yBk53GhS7A3JmEQlsiHRPhxIcqX3t5NAEue/P7nkC7CqJ49c54JiqCznLH0PVikdQVl6OirIiVJXkoyg7naTqQF1ZPg63DcJht+H3N9fB41Tx/oVeIWEeZTkeyGQDTAox/0nndfzDfzdiWtPRUJGHr62uhteTLk4MZMDbNq1EQZYHmbR2hktFTl4uMutWW98THnWw9VXGd08GbCOd78qRKYVEAE/tKuQWFtFidmS6HSlidTnRMYQo6bKTpMtqUZKVhslpDSc7rqXW6hsLpD7vP9uNnx1pFTYggqEeF4wFIpbRP7GsBksqC8X6ejQqZt63gNytZ+EaMB7GRfj231WFoku37yDV+TM+WiW3DCX164Q0mLy0YFZy/s2ZKzjTNYLGq6MiTi0jaf77yQ4caR1AOBZPrecnhthdHmruwwdNV28R1Hgwio5rkxzjUJ7rwfNblopTilFkP9c5gIrCHHCwTJDhy+nZCE6MIhEJQp4eK9IWP3XB5rvSeYcXso32vM6h3iTDzFm0BmmkEulOOgkilgbPLX2jaBuYSP1m+/IqPLu2Bt9evwBvvPUuLvZcvgXomz8/I2b7LAYYL1iARFoWJkJRDE2EhModONdN9jSO0ckgNjXUiv01crnZhGdk8jokLUw4u1+ln79/CwPRhh1rHZeOVLH0HYWkm9k5cDtUpDlstIgqiBkq8KaJo0+I5Ax4tK5EzM1nTuPyRwfv7ZdvV1ffFbK5byAEN3703jl8/7FFOH7pmnAQO1ZVIxTVEad9IjGK7ORE/EU1iPW3Q5nor2a8zub3z6T2UyYH/1KiUG7aXfBWLYKLDNNN4NOICZ6Z+NnqmgIUkb4fON+DsBYXKsKj42K7mLXfzZkTePVEAPJ1HTJ5GEmR8Z0NtbjuD2NrfTmdaiWCZBsspDQCz2oZidngrazD6FAnpFhE4KVlnrYlc3nF0XFsC2eVsjcfnqwc4foYsGDErsKl2oTBsitk9/jy9uXi6G8fpoOC18q0OTHAo748B88+sQZV+RnW7xkPeak4OQjeN2yPCwyMh3FNZBbAGBuAHPBtYdzCC0mG3qCEfHb2Bq6CChFVGSyDnvkxk41e7xr2W56DBnsfocvkWUamwl+opti1dn4KPKwqQghpZk8hxJTwCFd+ufBajJdxCwaU8f7vsfHyF+78EmsBDjxJiacCETHAYHt9gVsAM2PyzcXLfQwGdYdtkDea2bd3eALB6bDYm58xPhH4CC/jFiokacFVopJSHXB7vGLRGcD8WaWZF+V8nT0FG/TNg5mZTZ3mXI6Sjo+Q/vsCYZI0pR8VuWK/sUAE753poNo0jvrqUtidaZTVZAqcJiV/khZamWQgXCEyR6qgbARcobDOUhXAk6RY2nYLeN743c+6cLilH3Iocl8eaGYMjofwd0dPYZTAcipipRwyxYYMlFF8+KvvPI6uIXKrgWlEE0ks6ZmiupO06UqLgbiWydqnuDypsC+IX5atlPh2FRmjQPTnb58Sru5ufn4uY++RFugOr4i8HzReFfHmg8ZeVOZ5CayE0iyrfsj2esRJC3yUnxkYYNxeS2hmws4nINvsqdzFIohZEnRjU3Zvb1BaMAP+QcYr31qP0rIyYVu85inKl4RbvmYFy7arI6jJdWHd4uobuKjyE4BMw26dQMKw9EMUIjeaCinPcJt9/k9THy4OjuNhDlaNF59qII/kFTlUKSWMhZlpQmU5+fORiqWaHYxT4E4oggHy/wkWtjbci3D5PJieUssh0+inxf7+4AXx43Iy4O8/vpii5RC+rMFBbOaUgxGdEsQoOYgI1f2JmzozFjhTlg1LhSQ5Rk+d/Mbw5RaUlhaLBbhyevtkO/zRRCoB+8XRNiGRL3uYSaCMQ7XZMDx2HbLDquwSsaj1gqTEhOpQvu1n1hJ6BFpwEtf6+0X5NxUMY4q4z/E4U0bMhcuDuMy5DlGCznQyyD486WnQNCu9SGghcRSEe8pSIburnzgqFMGMqK+zHV6y+mW1Vfjukw2or8jH24c/QePpkw8d6NHDH8763CAczvQM1K5cB91QoKoq9HiQjJ3q6sCEOAHT4e6zGHBmnJXMxBpwyy8Rh6FFcf58Iy52D2B1fR1cegit+385Jz+fqHDMCbi+0QPHf03g46NH7/kee7qq1ZtJnQ1R1ESnyXlQMifakw7POYHJyCn/FfrPvZhq9SUoQzQoAwyHcbzpMk5TUV+0aCV87eehb/AgUTK71zcWOJHInVs443XMdAXSdGJWA2DmeFQuqhctGI0YYCbC4yNWW5KCLeF+0zoBRb1gpOfH5NCYXbT4CLxpxGjmnqaOmKahXy2GvWAK6qku6Js80HZlP7D6xBvcd2apn4Xg+A8L/LotX4UjIxuBYIRKUEM4lejYkGCA8RLuZmHE7k/fMhIZBUdZ+pTh0coEPq6LVh//zcRds1j+gmQqHIRj38RDtwdbc5jAW/HlkSe/gmWPbqU6IC6Iq7JweBq6r09oSSIj/wjjTqWCRlbp35g2VTRaBROGJjpmomvGRM+4ZfjN51+ymDhOTOyffGjglUsROH85Kj5vIPBrtz4tCiZ22TwzE4HBbtI9DYzTyCp75ZauhLP5wGkju6KXVYgbrdxw5X4/t/xmGCn2OlFfvxg/2L3HYuKjAOwHHpwJpSsK1xu+JPgtWP/VHcJ4maYJPBc4IUqpw72toovNOBnvHW2VeN683WwcrD6SnjwBZoDiA882My4WrahdhD984UUriTtKTBz0f2Hw8kAMrp+OiM/rH38SG7fvRDAaE0UTzyEiZmKis4kK92lhvPGcipdnbatwqyJevGinEhgpFLnDzG1LslcZJPBlhflwO+0oKC5GYUEB2poaofRoIsQb8533B96nQ/04CGUwhnhBLbY+86wIRVNhYoDIH9YwRYxM+EYQaj8tBBovqmtxdJ/ec9fWYqxm0yFlavglkrpsZXTJ7E6ybiomwzrmlRYIwEWURWZlZaKjtQVKNzFB6a9RPTcmpIAB+28DUD8JIZ4/H3pZPZz0+zS3SwCfAe+fCmLsLAW7aJDjlaFXrFynXr80dVcG+MvYvLWTtsmBbRzYbjBhVayBUBhZOXlwOR0irBeXV8DjSceV9otQrkRpExmJynsHM0kzYf/ATy6ZImt+DfSSJUK6sUgYebk5Fng6gSlKWUbO/RbmlI92ptysctWeK//0gw/3/uuv792d7vz57p/EyhoOChcqbCAsGkpUwgk619Qi8qEZWrh6Ix57+uvit+yZGNg96+AD1jtkczDyakSbhKorjA0PwecPWidAOZiv5SQS40PCKzIexjXn+wHSyZ0U0E6pgy1rEUv2O/hEiMYH+zDgW4i8rAyrb2OPo3btZkQo2Tpz5JAVRVUJ+pr0O9Z1vDMhwFMUhZFZKjyePHPBQTRIiSR3xEcbj4v2CQdTvbT+DOO5rwuO7h/vMqp/iM0U1k+pQ62rrETcumE0KZBMkm5KVMFxXTzT+uCcJRiOov30MRGQTOXWHpEAf8I6HcOTT2uRy45Gbng7msd7LiEemoQZHBeS10uWntOLF29mPPd1wZFkIkb6uS5WsfIAAxfulI5aiobgD1qdCK4RuCDnjoLPP40hI52DjBVb/m0MtraIBX7fDfB6UR1XU5CoMJe5OI8GLPWkdfWRqzADo0JQvC/vn/j2idhdPdnneQvmPLZ75Ota9fqXKPszhKRiYYw1HsW1K+0YnZpOMdHc2ISxgR7RsE148iwm/sVn2cVxCzz5cAJnEtgpyORZGLwctWyL1xWX5bSPVr1hD+9L4I0vfMl3S/b4Qu9PjLe3HbQNd7yjDl9ebgbGMN12AuGuC1CLqmFPy0Cgp43ijE0EG7424pxKjkyJiC1SbWKKJQ96JomL7pm0xbonhuqEXryoiU7oGwT8/u6J2z7ef1MRf7cu2+u86Irql9/aYhu5vNc20lmDaT9iPU2IcV81eVMvojkfLt9sOj2WVPmWhQGzusxyUx8vWthFhvpC96vPHam8sPv+b+pvZuAm5jjxZ6euzMQN1oqZFwq2fG+F2+naI01PPKKEJ1RRJSVbBybfM9zc2eASVpaFO5NEPUtBz52tm2nZn4SjkddGjrx58/+V4Jp1RnV41jjGUo0cv/2y+3YV4t54FmfYHNM+j3valHwe/pQ/e1fvqEvPyH6GzqCG1KJMhplGOp2qfBJ2d4zMdppy+AGSe1coMLFv6th/XrppudzPlbYkcTeBm7KTJPjx2RjQkh7/vju1U2ff5/h+6Uuu9ZP/80LgFOP/BBgA9rMI61XUFcAAAAAASUVORK5CYII=" > icon in the menu bar to <br> view the progress or press Ctrl(Cmd)+Shift+E </p>',
            timer: 8000,
            //showCloseButton: true
        })


        chrome.runtime.sendMessage({ message: "swal-fire" });
        lsManager = new LocalStorageManager();

        let url = window.location.href;
        let cmrUrl = getCmrQueryLink(url, true);
        let noOfGranules = getNoOfGranules();
        let granulesFetched = 0;
        let granuleCount = 0;
        let page = 1;
        let numberOfEntries = 0;
        let cmrUrlPaging;
        let cmrLinks = [];
        let itr = 0;

        let downloadInterval = setInterval(() => {
            if (granulesFetched < noOfGranules) {

                cmrUrlPaging = cmrUrl + [page];

                fetch(cmrUrlPaging)
                    .then(res => res.json())
                    .then((out) => {

                        let entries = out['feed']['entry'];
                        const dataSetName = "bulkDownloader_" + entries[0].dataset_id;

                        numberOfEntries = entries.length;
                        granuleCount += numberOfEntries;
                        if (numberOfEntries === 0) {
                            swal.fire("Empty Dataset", "Earthdata could not fing any granules for this search query. Please contact Earthdata Help Desk", "error");
                        }

                        let datasetName = out.feed.entry[0].dataset_id;

                        let loginLinks = [];


                        for (let i = 0; i < numberOfEntries; i++) {
                            cmrLinks[i] = out.feed.entry[i].links[0].href; //filters all the download link
                            if (itr == 0 && i < 10) { //first 10 link of a dataset
                                loginLinks.push(cmrLinks[i]);
                            }
                        }

                        lsManager.call(
                                lsManager.setItem(dataSetName, cmrLinks, "distinct"),
                                lsManager.setItem("bulkDownloader_loginLinks", loginLinks, "concat"),
                                lsManager.setItem("bulkDownloader_dataSets", dataSetName, "distinct")
                            )
                            .then(() => {
                                let firstItr = false;
                                if (itr == 0) {
                                    lsManager.call(lsManager.setItem("bulkDownloader_currentDataSet", dataSetName, "overwrite"));
                                    firstItr = true;
                                }

                                chrome.runtime.sendMessage({
                                    granuleCount: noOfGranules,
                                    dataSetName: dataSetName,
                                    datasetName: datasetName,
                                    firstItr: firstItr,
                                    number: numberOfEntries,
                                    message: "start-download"
                                })

                                chrome.storage.sync.set({ 'datasetName': datasetName });

                            })

                    })
                    .catch(err => {
                        swal.close();
                        swal.fire({
                            title: 'Could not fetch the download links',
                            type: 'error'
                        });
                        throw err
                    });

                granulesFetched = granulesFetched + 700;
                page++;
            } else {
                chrome.runtime.sendMessage({
                    message: "update-granuleCount",
                    granuleCount: granuleCount
                })
                clearInterval(downloadInterval);
                chrome.storage.local.get(null, item => console.log(item));
            }
        }, 50);

    }

    function addGranuleMutation() {

        const config = {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        };

        const granulesMutation = $(".button__badge.badge.badge-secondary")[0];

        //To check the change in number of granules
        let granuleMutationObserver = new MutationObserver(function(mutations, granuleMutationObserver) {
            updateButton();
        });

        granuleMutationObserver.observe(granulesMutation, config); //Observes the mutation
        updateButton();

    }

    function appendBulkDownloadButton() {
        let location = window.location.href;
        let baseUrl = "https://search.earthdata.nasa.gov/search/granules?";

        //appends the Bulk Download button only if the baseURL matches and does not exist already
        if (location.includes(baseUrl) && !document.getElementById("newBulkDownloadButton")) {

            //creates a new button element and the same class name is given as the existing Download Now Button
            let button = document.createElement("button");
            let text = document.createTextNode("Bulk Download All");
            button.appendChild(text);
            button.id = "newBulkDownloadButton";
            button.className = "granule-results-actions__download-all";
            $(".granule-results-actions").append(button);
            let newButton = $("#newBulkDownloadButton");
            let noOfGranules;

            updateButton();

            // //Function for a click listener on the New Bulk Download button
            // newButton.click(function openWin() {
            //     downloadFiles();
            // });

            newButton.click(function openWin() {
                fetch("https://urs.earthdata.nasa.gov/profile")
                    .then((out) => {

                        //Pops up the urs login window if the user is already not logged in
                        if (out.url === "https://urs.earthdata.nasa.gov/home" && out.redirected === true) {
                            let loginWindow;
                            loginWindow = window.open('https://urs.earthdata.nasa.gov/', loginWindow, 'width=600,height=600');
                            let loginInterval = window.setInterval(function() {
                                if (document.cookie.match(/^.*urs_user_already_logged=yes.*$/)) {
                                    if (loginWindow) loginWindow.close();
                                    clearInterval(loginInterval);
                                    downloadFiles();
                                }
                            }, 1000);

                        } else {
                            downloadFiles();
                        }

                    })
                    .catch(err => {
                        swal.close();
                        swal.fire({
                            title: 'Could not fetch login page\nPlease login to URS website and try again',
                            type: 'error'
                        });
                        console.error("Error in fetching Logged in status");
                        throw err
                    });
            })
        }
    }

    let interval;

    function addMutation() {
        let buttonCount = $(".granule-results-actions__download-all").find("button").length;
        if (buttonCount === 1) {
            appendBulkDownloadButton();
            addGranuleMutation();
        }
    }

    addMutation();
    interval = setInterval(addMutation, 1000);

    function updateButton() {
        let isDownloadable;
        if (getNoOfGranules() != 0 && hasDownloadableLinks) {
            isDownloadable = true;
        } else {
            isDownloadable = false;
        }

        if (document.getElementById("newBulkDownloadButton")) {
            newButton = $("#newBulkDownloadButton");
            if (isDownloadable) {
                newButton.prop('disabled', false);
                let noOfGranules = $(".button__badge.badge.badge-secondary").first().text();
                newButton.html('<i class="fa fa-download"></i> Bulk Download All ' +
                    '<span class="button__badge badge badge-secondary" >' + noOfGranules + '</span>');
                newButton.css({
                    "border": "1px solid transparent",
                    "margin": "1%",
                    "background": "#2b7fb9",
                    "padding": ".375rem .75rem",
                    "color": "white",
                    "cursor": "pointer"
                });

            } else {
                newButton.prop('disabled', true);
                newButton.html('<i class="fa fa-download"></i> Bulk Download All ' +
                    '<span class="button__badge badge badge-secondary" >' + "Disabled" + '</span>');
                newButton.css({
                    "border": "1px solid transparent",
                    "margin": "1%",
                    "padding": ".375rem .75rem",
                    "background": "#A9A9A9",
                    "color": "white",
                    "cursor": "not-allowed"
                });

            }
        }
    };

    function getUrlVars(url) {
        let decodedUrl = decodeURIComponent(url);
        let vars = {};
        let parts = decodedUrl.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
            vars[key] = value;
        });
        return vars;
    }

    function checkUrlChange() {
        if (getUrlVars(window.location.href)['p']) {

            if (lastURL != window.location.href) {
                if (getUrlVars(lastURL)['p'] != window.location.href['p']) {
                    getUpdateButtonPromise();
                    lastURL = window.location.href;
                }
            }
        }

        if (!getUrlVars(lastURL)['p'] && getUrlVars(window.location.href)['p']) {
            getUpdateButtonPromise();
            lastURL = window.location.href;
        }


    }

    let checkUrlInterval = setInterval(checkUrlChange, 1000);

    function checkCurrentUrl() {
        let baseUrl = "https://search.earthdata.nasa.gov/search/granules?";
        if ((window.location.href).includes(baseUrl)) {
            getUpdateButtonPromise();
        } else {
            setTimeout(checkCurrentUrl, 1000);
        }
    }
    checkCurrentUrl();

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.message && request.message == "clear-swal-fire") {
                //swal.close();
                sendResponse({
                    message: "swal-closed"
                });
            }
        });

    $(document).idle({
        onActive: function() {
            window.location.reload();
        },
        idle: 900000
    });

    function getNoOfGranules() {
        let numberOfGranules = $(".button__badge.badge.badge-secondary").first().text();
        let numberOfGranulesString = [];
        numberOfGranulesString = numberOfGranules.split(" ");

        let noOfGranules = 0;
        if (numberOfGranulesString[0].includes(",")) {
            noOfGranules = parseInt(numberOfGranulesString[0].replace(/,/g, ""));
        } else {
            noOfGranules = parseInt(numberOfGranulesString[0]);
        }

        return noOfGranules;
    }
});